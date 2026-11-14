import 'dotenv/config';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

type Account = {
  token: string;
  userId: string;
  farmerId?: string;
  buyerId?: string;
};
type Envelope = {
  success: boolean;
  data: Record<string, any>;
  message?: unknown;
};
const run = randomUUID();
const userIds: string[] = [];
let child: ChildProcess | undefined;
let db: PrismaClient | undefined;
let base: string;
let farmer: Account;
let otherFarmer: Account;
let buyer: Account;
let otherBuyer: Account;

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

async function account(
  role: 'FARMER' | 'BUYER',
  label: string,
): Promise<Account> {
  const result = await api('POST', '/auth/register', undefined, {
    name: `Smoke ${label}`,
    ...(label === 'farmer' ? {} : { email: `${label}-${run}@example.test` }),
    phone: `+91${randomBytes(6).readUIntBE(0, 6).toString().padStart(15, '0').slice(-10)}`,
    password: 'SmokePassword123!',
    role,
  });
  expect(result.status).toBe(201);
  const user = result.body.data.user;
  userIds.push(user.id);
  expect(JSON.stringify(result.body)).not.toContain('passwordHash');
  return {
    token: result.body.data.accessToken,
    userId: user.id,
    farmerId: user.farmerProfile?.id,
    buyerId: user.buyerProfile?.id,
  };
}

async function product(owner = farmer, quantity = '500') {
  const result = await api('POST', '/products', owner.token, {
    name: `Smoke tomatoes ${run}`,
    category: 'Vegetables',
    description: 'Automated smoke fixture',
    quantity,
    unit: 'kg',
    pricePerUnit: '25.00',
    location: 'Demo district',
  });
  expect(result.status).toBe(201);
  return result.body.data.id as string;
}

const orderBody = (productId: string, quantity: string) => ({
  items: [{ productId, quantity }],
  deliveryAddress: 'Smoke test delivery address',
});
const stock = async (id: string) =>
  (
    await db!.product.findUniqueOrThrow({ where: { id } })
  ).availableQuantity.toString();

beforeAll(async () => {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url)
    throw new Error(
      'Real PostgreSQL smoke tests require TEST_DATABASE_URL or DATABASE_URL in server/.env. Run db:migrate first.',
    );
  db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: url,
      connectionTimeoutMillis: 5000,
    }),
  });
  await db.$connect();
  await db.user.count(); // Verify migrations exist before spawning the server.
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const address = reservation.address();
  if (!address || typeof address === 'string')
    throw new Error('No free HTTP port');
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    reservation.close((error) => (error ? reject(error) : resolve())),
  );
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['dist/main.js'], {
    cwd: process.cwd(),
    windowsHide: true,
    env: {
      ...process.env,
      DATABASE_URL: url,
      PORT: String(port),
      JWT_SECRET: randomBytes(48).toString('hex'),
      OBSERVE_APP_KEY: '',
      OBSERVE_APP_SECRET: '',
      CLIENT_URL: 'http://localhost:3000',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stderr?.on('data', () => {}); // Never echo a database connection string from startup errors.
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new Error(
            'Backend startup timed out; check database connectivity and build output',
          ),
        ),
      15000,
    );
    child!.once('error', () => {
      clearTimeout(timer);
      reject(new Error('Could not launch compiled backend'));
    });
    child!.once('exit', () => {
      clearTimeout(timer);
      reject(
        new Error(
          'Backend exited during startup; verify configuration and migrations',
        ),
      );
    });
    child!.stdout?.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes('Backend listening on')) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  farmer = await account('FARMER', 'farmer');
  otherFarmer = await account('FARMER', 'other-farmer');
  buyer = await account('BUYER', 'buyer');
  otherBuyer = await account('BUYER', 'other-buyer');
}, 30000);

afterAll(async () => {
  if (child && child.exitCode === null) {
    child.kill();
    await once(child, 'exit');
  }
  if (db) {
    // Delete only fixtures created by this run, respecting foreign keys.
    if (userIds.length)
      await db.$transaction(async (tx) => {
        const farmers = await tx.farmerProfile.findMany({
          where: { userId: { in: userIds } },
          select: { id: true },
        });
        const buyers = await tx.buyerProfile.findMany({
          where: { userId: { in: userIds } },
          select: { id: true },
        });
        const orders = await tx.order.findMany({
          where: { buyerId: { in: buyers.map((b) => b.id) } },
          select: { id: true },
        });
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orders.map((o) => o.id) } },
        });
        await tx.order.deleteMany({
          where: { id: { in: orders.map((o) => o.id) } },
        });
        await tx.product.deleteMany({
          where: { farmerId: { in: farmers.map((f) => f.id) } },
        });
        await tx.buyerProfile.deleteMany({
          where: { userId: { in: userIds } },
        });
        await tx.farmerProfile.deleteMany({
          where: { userId: { in: userIds } },
        });
        await tx.user.deleteMany({ where: { id: { in: userIds } } });
      });
    await db.$disconnect();
  }
}, 15000);

describe('real PostgreSQL + compiled HTTP backend', () => {
  it('authenticates safely and enforces role and ownership boundaries', async () => {
    expect((await api('GET', '/auth/me')).status).toBe(401);
    expect((await api('GET', '/auth/me', 'invalid')).status).toBe(401);
    expect((await api('GET', '/auth/me', farmer.token)).body.data.id).toBe(
      farmer.userId,
    );
    expect((await api('GET', '/farmers/me', buyer.token)).status).toBe(403);
    expect(
      (
        await api('POST', '/auth/register', undefined, {
          name: 'Unauthorized Admin',
          email: `admin-${run}@example.test`,
          phone: '+919000000099',
          password: 'SmokePassword123!',
          role: 'ADMIN',
        })
      ).status,
    ).toBe(400);
    const login = await api('POST', '/auth/login', undefined, {
      identifier: `BUYER-${run}@EXAMPLE.TEST`,
      password: 'SmokePassword123!',
    });
    expect(login.status).toBe(200);
    expect(JSON.stringify(login.body)).not.toContain('passwordHash');
    expect(
      (
        await api('POST', '/auth/login', undefined, {
          identifier: `buyer-${run}@example.test`,
          password: 'wrong',
        })
      ).status,
    ).toBe(401);
    expect((await api('POST', '/products', buyer.token, {})).status).toBe(403);
    const id = await product();
    expect(
      (
        await api('PATCH', `/products/${id}`, otherFarmer.token, {
          name: 'Stolen',
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await api('PATCH', `/products/${id}`, farmer.token, {
          availableQuantity: '999',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await api('PATCH', `/products/${id}`, farmer.token, {
          pricePerUnit: null,
        })
      ).status,
    ).toBe(400);
    const ownOrder = await api(
      'POST',
      '/orders',
      buyer.token,
      orderBody(id, '1'),
    );
    expect(ownOrder.status).toBe(201);
    expect(
      (await api('GET', `/orders/${ownOrder.body.data.id}`, otherBuyer.token))
        .status,
    ).toBe(404);
    expect(
      (
        await api(
          'PATCH',
          `/orders/${ownOrder.body.data.id}/status`,
          otherFarmer.token,
          { status: 'CONFIRMED' },
        )
      ).status,
    ).toBe(403);
    await api('POST', `/orders/${ownOrder.body.data.id}/cancel`, buyer.token);
    await db!.user.update({
      where: { id: otherBuyer.userId },
      data: { isActive: false },
    });
    expect((await api('GET', '/auth/me', otherBuyer.token)).status).toBe(401);
    await db!.user.update({
      where: { id: otherBuyer.userId },
      data: { isActive: true },
    });
  });

  it('reserves 300 of 500 kg, rejects 201 kg, and restores stock exactly once', async () => {
    const id = await product();
    const created = await api(
      'POST',
      '/orders',
      buyer.token,
      orderBody(id, '300'),
    );
    expect(created.status).toBe(201);
    expect(created.body.data.totalAmount).toBe('7500');
    expect(await stock(id)).toBe('200');
    expect(
      (await api('POST', '/orders', buyer.token, orderBody(id, '201'))).status,
    ).toBe(409);
    expect(await stock(id)).toBe('200');
    const cancellation = await Promise.all([
      api('POST', `/orders/${created.body.data.id}/cancel`, buyer.token),
      api('POST', `/orders/${created.body.data.id}/cancel`, buyer.token),
    ]);
    expect(cancellation.map((r) => r.status).sort((a, b) => a - b)).toEqual([
      200, 409,
    ]);
    expect(await stock(id)).toBe('500');
  });

  it('prevents two concurrent 300 kg orders against 500 kg', async () => {
    const id = await product();
    const results = await Promise.all([
      api('POST', '/orders', buyer.token, orderBody(id, '300')),
      api('POST', '/orders', otherBuyer.token, orderBody(id, '300')),
    ]);
    expect(results.map((r) => r.status).sort((a, b) => a - b)).toEqual([
      201, 409,
    ]);
    expect(await stock(id)).toBe('200');
    expect(await db!.orderItem.count({ where: { productId: id } })).toBe(1);
  });

  it('rolls back earlier stock reservations when a cart fails', async () => {
    const ids = [await product(), await product()].sort();
    const [first, second] = ids;
    // Ensure the failing item sorts after the first successful reservation.
    await db!.product.update({
      where: { id: second },
      data: { quantity: '1', availableQuantity: '1' },
    });
    const result = await api('POST', '/orders', buyer.token, {
      items: ids.map((id) => ({
        productId: id,
        quantity: id === second ? '2' : '10',
      })),
      deliveryAddress: 'Smoke rollback address',
    });
    expect(result.status).toBe(409);
    expect(await stock(first)).toBe('500');
    expect(await stock(second)).toBe('1');
    const foreign = await product(otherFarmer);
    expect(
      (
        await api('POST', '/orders', buyer.token, {
          items: [
            { productId: first, quantity: '1' },
            { productId: foreign, quantity: '1' },
          ],
          deliveryAddress: 'Smoke mixed cart address',
        })
      ).status,
    ).toBe(400);
    expect(await stock(first)).toBe('500');
    expect(await stock(foreign)).toBe('500');
  });

  it('enforces transitions, snapshots prices, and keeps inactive stock hidden after rejection', async () => {
    const id = await product();
    const created = await api(
      'POST',
      '/orders',
      buyer.token,
      orderBody(id, '500'),
    );
    const orderId = created.body.data.id;
    expect(created.status).toBe(201);
    expect((await api('GET', `/products/${id}`)).status).toBe(404);
    expect(
      (
        await api('PATCH', `/orders/${orderId}/status`, farmer.token, {
          status: 'COMPLETED',
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await api('PATCH', `/products/${id}`, farmer.token, {
          pricePerUnit: '99',
        })
      ).status,
    ).toBe(200);
    expect(
      (await api('GET', `/orders/${orderId}`, buyer.token)).body.data
        .totalAmount,
    ).toBe('12500');
    expect(
      (
        await api('PATCH', `/orders/${orderId}/status`, farmer.token, {
          status: 'CONFIRMED',
        })
      ).status,
    ).toBe(200);
    expect(
      (await api('POST', `/orders/${orderId}/cancel`, buyer.token)).status,
    ).toBe(409);
    expect(
      (
        await api('PATCH', `/orders/${orderId}/status`, farmer.token, {
          status: 'COMPLETED',
        })
      ).status,
    ).toBe(200);
    const hidden = await product();
    const pending = await api(
      'POST',
      '/orders',
      buyer.token,
      orderBody(hidden, '100'),
    );
    await api('DELETE', `/products/${hidden}`, farmer.token);
    expect(
      (
        await api(
          'PATCH',
          `/orders/${pending.body.data.id}/status`,
          farmer.token,
          { status: 'REJECTED' },
        )
      ).status,
    ).toBe(200);
    expect(await stock(hidden)).toBe('500');
    expect((await api('GET', `/products/${hidden}`)).status).toBe(404);
  });
});
