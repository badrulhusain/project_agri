import 'dotenv/config';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

type Envelope = {
  success: boolean;
  data: any;
  items?: Record<string, any>[];
  meta?: Record<string, any>;
  message?: unknown;
};

const run = randomUUID().slice(0, 8);
let child: ChildProcess | undefined;
let db: PrismaClient | undefined;
let base: string;

let buyerToken: string;
let buyerUserId: string;
let buyerProfileId: string;

let otherBuyerToken: string;
let otherBuyerUserId: string;

let farmerToken: string;
let farmerUserId: string;
let farmerProfileId: string;

let createdProductId: string;

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

  // Register primary buyer
  const buyerPhone = `+9198${randomBytes(4).readUInt32BE(0).toString().slice(-8).padStart(8, '0')}`;
  const buyerRes = await api('POST', '/auth/register', undefined, {
    name: `Buyer Test ${run}`,
    email: `buyer-${run}@example.test`,
    phone: buyerPhone,
    password: 'BuyerPassword123!',
    role: 'BUYER',
  });
  expect(buyerRes.status).toBe(201);
  buyerToken = buyerRes.body.data.accessToken;
  buyerUserId = buyerRes.body.data.user.id;
  buyerProfileId = buyerRes.body.data.user.buyerProfile.id;

  // Register secondary buyer (for ownership testing)
  const otherBuyerPhone = `+9198${randomBytes(4).readUInt32BE(0).toString().slice(-8).padStart(8, '0')}`;
  const otherBuyerRes = await api('POST', '/auth/register', undefined, {
    name: `Other Buyer ${run}`,
    email: `other-buyer-${run}@example.test`,
    phone: otherBuyerPhone,
    password: 'BuyerPassword123!',
    role: 'BUYER',
  });
  expect(otherBuyerRes.status).toBe(201);
  otherBuyerToken = otherBuyerRes.body.data.accessToken;
  otherBuyerUserId = otherBuyerRes.body.data.user.id;

  // Register farmer
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
  farmerProfileId = farmerRes.body.data.user.farmerProfile.id;

  // Create a product by farmer
  const productRes = await api('POST', '/products', farmerToken, {
    name: `Organic Carrots ${run}`,
    category: 'Vegetables',
    description: 'Fresh crunchy organic carrots',
    quantity: '200',
    unit: 'kg',
    pricePerUnit: '45.00',
    location: 'Ooty, Tamil Nadu',
    images: ['https://example.com/carrots.jpg'],
  });
  expect(productRes.status).toBe(201);
  createdProductId = productRes.body.data.id;
}, 30000);

afterAll(async () => {
  if (child && !child.killed) {
    child.kill();
    await once(child, 'exit');
  }
  if (db) {
    if (buyerProfileId) {
      await db.buyerRequirement.deleteMany({ where: { buyerId: buyerProfileId } }).catch(() => {});
    }
    if (buyerUserId) {
      await db.wishlistItem.deleteMany({ where: { userId: buyerUserId } }).catch(() => {});
      await db.buyerProfile.deleteMany({ where: { userId: buyerUserId } }).catch(() => {});
      await db.user.delete({ where: { id: buyerUserId } }).catch(() => {});
    }
    if (otherBuyerUserId) {
      await db.wishlistItem.deleteMany({ where: { userId: otherBuyerUserId } }).catch(() => {});
      await db.buyerProfile.deleteMany({ where: { userId: otherBuyerUserId } }).catch(() => {});
      await db.user.delete({ where: { id: otherBuyerUserId } }).catch(() => {});
    }
    if (farmerUserId) {
      if (createdProductId) {
        await db.product.deleteMany({ where: { id: createdProductId } }).catch(() => {});
      }
      if (farmerProfileId) {
        await db.farmerProfile.deleteMany({ where: { id: farmerProfileId } }).catch(() => {});
      }
      await db.user.delete({ where: { id: farmerUserId } }).catch(() => {});
    }
    await db.$disconnect();
  }
});

describe('Buyer Requirements Endpoints', () => {
  let createdReqId: string;

  it('rejects requirement creation by unauthenticated users', async () => {
    const res = await api('POST', '/buyer-requirements', undefined, {
      productName: 'Fresh Onions',
      category: 'Vegetables',
      quantity: '500',
      unit: 'kg',
      location: 'Kochi',
      description: 'Need quality onions',
    });
    expect(res.status).toBe(401);
  });

  it('rejects requirement creation by non-buyers (FARMER)', async () => {
    const res = await api('POST', '/buyer-requirements', farmerToken, {
      productName: 'Fresh Onions',
      category: 'Vegetables',
      quantity: '500',
      unit: 'kg',
      location: 'Kochi',
      description: 'Need quality onions',
    });
    expect(res.status).toBe(403);
  });

  it('creates requirement for authenticated BUYER', async () => {
    const res = await api('POST', '/buyer-requirements', buyerToken, {
      productName: `Fresh Red Onions ${run}`,
      category: 'Vegetables',
      quantity: '1500',
      unit: 'kg',
      targetPrice: '28.00',
      neededBy: 'Within 3 days',
      urgency: 'URGENT',
      location: 'Ernakulam, Kerala',
      deliveryAddress: 'Central Warehouse, Kalamassery',
      description: 'Seeking medium-to-large sorted Nashik red onions.',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productName).toBe(`Fresh Red Onions ${run}`);
    expect(res.body.data.status).toBe('OPEN');
    expect(res.body.data.urgency).toBe('URGENT');
    expect(res.body.data.buyerName).toContain('Buyer Test');
    createdReqId = res.body.data.id;
  });

  it('allows public to list open requirements with search & category filters', async () => {
    const res = await api('GET', `/buyer-requirements?search=${encodeURIComponent(run)}&category=Vegetables`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((r: any) => r.id === createdReqId);
    expect(found).toBeDefined();
    expect(found.productName).toBe(`Fresh Red Onions ${run}`);
  });

  it('lists requirements for the authenticated buyer under /my', async () => {
    const res = await api('GET', '/buyer-requirements/my', buyerToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.data.find((r: any) => r.id === createdReqId);
    expect(found).toBeDefined();
  });

  it('prevents another buyer from updating status', async () => {
    const res = await api(
      'PATCH',
      `/buyer-requirements/${createdReqId}`,
      otherBuyerToken,
      { status: 'FULFILLED' },
    );
    expect(res.status).toBe(403);
  });

  it('allows owner buyer to update status to FULFILLED', async () => {
    const res = await api(
      'PATCH',
      `/buyer-requirements/${createdReqId}`,
      buyerToken,
      { status: 'FULFILLED' },
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('FULFILLED');
  });

  it('prevents another buyer from deleting requirement', async () => {
    const res = await api(
      'DELETE',
      `/buyer-requirements/${createdReqId}`,
      otherBuyerToken,
    );
    expect(res.status).toBe(403);
  });

  it('allows owner buyer to delete requirement', async () => {
    const res = await api(
      'DELETE',
      `/buyer-requirements/${createdReqId}`,
      buyerToken,
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const check = await api('GET', `/buyer-requirements/${createdReqId}`);
    expect(check.status).toBe(404);
  });
});

describe('Wishlist Endpoints', () => {
  it('rejects unauthenticated requests to /wishlist', async () => {
    const res = await api('GET', '/wishlist');
    expect(res.status).toBe(401);
  });

  it('rejects non-buyer (FARMER) access to /wishlist', async () => {
    const res = await api('GET', '/wishlist', farmerToken);
    expect(res.status).toBe(403);
  });

  it('adds product to buyer wishlist', async () => {
    const res = await api(
      'POST',
      `/wishlist/${createdProductId}`,
      buyerToken,
    );
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productId).toBe(createdProductId);
  });

  it('lists wishlisted products for the authenticated buyer', async () => {
    const res = await api('GET', '/wishlist', buyerToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find(
      (item: any) => item.productId === createdProductId,
    );
    expect(found).toBeDefined();
    expect(found.name).toBe(`Organic Carrots ${run}`);
  });

  it('returns empty wishlist for buyer who has not wishlisted anything', async () => {
    const res = await api('GET', '/wishlist', otherBuyerToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('removes product from buyer wishlist', async () => {
    const res = await api(
      'DELETE',
      `/wishlist/${createdProductId}`,
      buyerToken,
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is removed
    const listRes = await api('GET', '/wishlist', buyerToken);
    const found = listRes.body.data.find(
      (item: any) => item.productId === createdProductId,
    );
    expect(found).toBeUndefined();
  });

  it('returns 404 when removing non-wishlisted product', async () => {
    const res = await api(
      'DELETE',
      `/wishlist/${createdProductId}`,
      buyerToken,
    );
    expect(res.status).toBe(404);
  });
});
