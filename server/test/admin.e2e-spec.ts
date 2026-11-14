import 'dotenv/config';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

type Envelope = {
  success: boolean;
  data: Record<string, any>;
  items?: Record<string, any>[];
  meta?: Record<string, any>;
  message?: unknown;
};

const run = randomUUID().slice(0, 8);
let child: ChildProcess | undefined;
let db: PrismaClient | undefined;
let base: string;

let adminToken: string;
let adminUserId: string;
let farmerToken: string;
let farmerUserId: string;

async function api(
  method: string,
  path: string,
  token?: string,
  body?: unknown,
) {
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: (await response.json()) as Envelope };
}

beforeAll(async () => {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('Database URL required for e2e test');

  db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: url,
      connectionTimeoutMillis: 5000,
    }),
  });
  await db.$connect();

  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const address = reservation.address();
  if (!address || typeof address === 'string') throw new Error('No free port');
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    reservation.close((err) => (err ? reject(err) : resolve())),
  );
  base = `http://127.0.0.1:${port}`;

  const jwtSecret = randomBytes(48).toString('hex');
  child = spawn(process.execPath, ['dist/main.js'], {
    cwd: process.cwd(),
    windowsHide: true,
    env: {
      ...process.env,
      DATABASE_URL: url,
      PORT: String(port),
      JWT_SECRET: jwtSecret,
      OBSERVE_APP_KEY: '',
      OBSERVE_APP_SECRET: '',
      CLIENT_URL: 'http://localhost:3000',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Backend startup timed out')),
      15000,
    );
    child?.stdout?.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes('Backend listening on')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child?.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited with code ${code}`));
    });
  });

  // Create an admin user directly with bcrypt
  const passwordHash = await bcrypt.hash('AdminTest123!', 10);
  const adminUser = await db.user.create({
    data: {
      name: `Admin Test ${run}`,
      email: `admin-${run}@example.test`,
      phone: `+9198${randomBytes(4).readUInt32BE(0).toString().slice(-8).padStart(8, '0')}`,
      passwordHash,
      role: 'ADMIN',
    },
  });
  adminUserId = adminUser.id;

  // Login as admin
  const adminLogin = await api('POST', '/auth/login', undefined, {
    identifier: adminUser.email,
    password: 'AdminTest123!',
  });
  expect(adminLogin.status).toBe(200);
  adminToken = adminLogin.body.data.accessToken;

  // Register a farmer
  const farmerPhone = `+9197${randomBytes(4).readUInt32BE(0).toString().slice(-8).padStart(8, '0')}`;
  const farmerRes = await api('POST', '/auth/register', undefined, {
    name: `Farmer Test ${run}`,
    email: `farmer-${run}@example.test`,
    phone: farmerPhone,
    password: 'FarmerPassword123!',
    role: 'FARMER',
  });
  expect(farmerRes.status).toBe(201);
  farmerToken = farmerRes.body.data.accessToken;
  farmerUserId = farmerRes.body.data.user.id;
}, 30000);

afterAll(async () => {
  if (child && !child.killed) {
    child.kill();
    await once(child, 'exit');
  }
  if (db) {
    if (adminUserId) await db.user.delete({ where: { id: adminUserId } }).catch(() => {});
    if (farmerUserId) {
      await db.farmerProfile.deleteMany({ where: { userId: farmerUserId } }).catch(() => {});
      await db.user.delete({ where: { id: farmerUserId } }).catch(() => {});
    }
    await db.$disconnect();
  }
});

describe('Admin API Authorization & Envelope', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await api('GET', '/admin/overview');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-admin role (FARMER) with 403', async () => {
    const res = await api('GET', '/admin/overview', farmerToken);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('allows ADMIN role with standard { success, data, message } envelope', async () => {
    const res = await api('GET', '/admin/overview', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.totalUsers).toBe('number');
    expect(typeof res.body.data.farmers).toBe('number');
    expect(typeof res.body.data.buyers).toBe('number');
    expect(typeof res.body.data.activeProducts).toBe('number');
    expect(typeof res.body.data.totalOrders).toBe('number');
    expect(typeof res.body.data.pendingOrders).toBe('number');
    expect(typeof res.body.data.completedOrders).toBe('number');
    expect(typeof res.body.data.publishedSchemes).toBe('number');
    expect(typeof res.body.data.openSurplus).toBe('number');
    expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
  });
});

describe('Admin Users Management', () => {
  it('GET /api/admin/users returns paginated list without passwordHash', async () => {
    const res = await api('GET', '/admin/users?page=1&limit=10', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const items = res.body.data.items ?? res.body.items;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);

    const first = items[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(first.role).toBeDefined();
    expect(first.isActive).toBeDefined();
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('GET /api/admin/users filters by search and role', async () => {
    const res = await api('GET', `/admin/users?search=${run}&role=FARMER`, adminToken);
    expect(res.status).toBe(200);
    const items = res.body.data.items ?? res.body.items;
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(farmerUserId);
  });

  it('PATCH /api/admin/users/:id/status updates isActive and disables access', async () => {
    const deactivate = await api(
      'PATCH',
      `/admin/users/${farmerUserId}/status`,
      adminToken,
      { isActive: false },
    );
    expect(deactivate.status).toBe(200);
    expect(deactivate.body.data.isActive).toBe(false);

    // Inactive farmer should be blocked
    const farmerTry = await api('GET', '/auth/me', farmerToken);
    expect(farmerTry.status).toBe(401);

    // Reactivate
    const reactivate = await api(
      'PATCH',
      `/admin/users/${farmerUserId}/status`,
      adminToken,
      { isActive: true },
    );
    expect(reactivate.status).toBe(200);
    expect(reactivate.body.data.isActive).toBe(true);
  });
});

describe('Admin Products, Orders, Schemes, Surplus, Settings', () => {
  it('GET /api/admin/products returns paginated products', async () => {
    const res = await api('GET', '/admin/products?page=1&limit=5', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const items = res.body.data.items ?? res.body.items;
    expect(Array.isArray(items)).toBe(true);
  });

  it('GET /api/admin/orders returns paginated orders', async () => {
    const res = await api('GET', '/admin/orders?page=1&limit=5', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const items = res.body.data.items ?? res.body.items;
    expect(Array.isArray(items)).toBe(true);
  });

  let createdSchemeId: string;

  it('POST /api/admin/schemes creates a new scheme', async () => {
    const res = await api('POST', '/admin/schemes', adminToken, {
      name: `Test Agriculture Scheme ${run}`,
      description: 'Comprehensive test scheme description for farmers',
      benefits: 'Financial subsidy for modern farming tools',
      department: 'Dept of Agriculture',
      status: 'PUBLISHED',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toContain(`Test Agriculture Scheme ${run}`);
    createdSchemeId = res.body.data.id;
  });

  it('PATCH /api/admin/schemes/:id updates an existing scheme', async () => {
    const res = await api('PATCH', `/admin/schemes/${createdSchemeId}`, adminToken, {
      benefits: 'Updated benefits: Rs 10000 equipment subsidy',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.benefits).toBe('Updated benefits: Rs 10000 equipment subsidy');
  });

  it('GET /api/admin/schemes returns paginated schemes list', async () => {
    const res = await api('GET', '/admin/schemes?page=1&limit=10', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const items = res.body.data.items ?? res.body.items;
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((s: any) => s.id === createdSchemeId)).toBe(true);
  });

  it('GET /api/admin/surplus returns paginated surplus records', async () => {
    const res = await api('GET', '/admin/surplus?page=1&limit=10', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const items = res.body.data.items ?? res.body.items;
    expect(Array.isArray(items)).toBe(true);
  });

  it('GET /api/admin/settings returns platform config object', async () => {
    const res = await api('GET', '/admin/settings', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.platformName).toBeDefined();
    expect(res.body.data.currency).toBe('INR');
    expect(res.body.data.features.schemes).toBe(true);
  });
});
