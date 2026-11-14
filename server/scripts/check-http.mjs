// Compiled Nest wiring/validation checks with a stub identity provider only.
// This intentionally performs no database operations and is not a stock test.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Test } from '@nestjs/testing';

process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.OBSERVE_APP_KEY = '';
process.env.OBSERVE_APP_SECRET = '';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.PORT = '3001';
const { AppModule } = await import('../dist/app.module.js');
const { PrismaService } = await import('../dist/prisma/prisma.service.js');
const { setupApplication } = await import('../dist/setup.js');
const fixture = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(PrismaService)
  .useValue({})
  .compile();
const app = fixture.createNestApplication();
try {
  setupApplication(app);
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  let checks = 0;
  async function check(path, expected, init) {
    const response = await fetch(`${base}${path}`, init);
    assert.equal(response.status, expected, `${path} HTTP status`);
    checks++;
    return response;
  }
  const root = await check('/api', 200);
  assert.deepEqual(await root.json(), { success: true, data: 'Hello World!' });
  const documentation = await check('/api/docs-json', 200);
  const spec = await documentation.json();
  assert.ok(spec.paths['/api/orders/{id}/cancel']);
  assert.ok(spec.paths['/api/products']);
  await check('/api/auth/me', 401);
  await check('/api/auth/me', 401, {
    headers: { Authorization: 'Bearer invalid' },
  });
  await check('/api/products/not-a-uuid', 400);
  await check('/api/auth/register', 400, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Invalid Admin',
      email: 'test@example.test',
      phone: '+919000000099',
      password: 'ExamplePassword123!',
      role: 'ADMIN',
    }),
  });
  await check('/api/auth/login', 400, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  await check('/api/products?limit=1000', 400);
  const cors = await check('/api', 200, {
    headers: { Origin: 'http://localhost:3000' },
  });
  assert.equal(
    cors.headers.get('access-control-allow-origin'),
    'http://localhost:3000',
  );
  console.log(
    `${checks} compiled HTTP wiring checks passed. Identity/database provider was stubbed; real PostgreSQL smoke tests remain separate.`,
  );
} finally {
  await app.close();
}
