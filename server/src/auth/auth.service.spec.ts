import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('authentication', () => {
  it('hashes passwords and creates only the correct role profile', async () => {
    const create = vi
      .fn()
      .mockResolvedValue({ id: 'farmer-id', role: 'FARMER', name: 'Demo' });
    const signAsync = vi.fn().mockResolvedValue('signed-token');
    const auth = new AuthService(
      { user: { create } } as unknown as PrismaService,
      { signAsync } as unknown as JwtService,
    );
    const result = await auth.register({
      name: 'Demo',
      email: 'demo@example.test',
      password: 'ExamplePassword123!',
      role: 'FARMER',
    });
    const args = create.mock.calls[0][0];
    expect(args.data.passwordHash).not.toBe('ExamplePassword123!');
    expect(
      await bcrypt.compare('ExamplePassword123!', args.data.passwordHash),
    ).toBe(true);
    expect(args.data.farmerProfile).toEqual({ create: {} });
    expect(args.data.buyerProfile).toBeUndefined();
    expect(args.select.passwordHash).toBeUndefined();
    expect(result.accessToken).toBe('signed-token');
  });
  it('rejects invalid credentials and inactive accounts', async () => {
    const passwordHash = await bcrypt.hash('ExamplePassword123!', 4);
    const findFirst = vi
      .fn()
      .mockResolvedValue({ id: 'user', passwordHash, isActive: false });
    const signAsync = vi.fn();
    const auth = new AuthService(
      { user: { findFirst } } as unknown as PrismaService,
      { signAsync } as unknown as JwtService,
    );
    await expect(
      auth.login({ identifier: 'demo@example.test', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
    await expect(
      auth.login({
        identifier: 'demo@example.test',
        password: 'ExamplePassword123!',
      }),
    ).rejects.toThrow('Invalid credentials');
    findFirst.mockResolvedValue(null);
    await expect(
      auth.login({ identifier: 'missing@example.test', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
    expect(signAsync).not.toHaveBeenCalled();
  });
  it('normalizes login email and returns a safe selection', async () => {
    const passwordHash = await bcrypt.hash('ExamplePassword123!', 4);
    const findFirst = vi
      .fn()
      .mockResolvedValue({ id: 'user', passwordHash, isActive: true });
    const findUniqueOrThrow = vi
      .fn()
      .mockResolvedValue({ id: 'user', email: 'demo@example.test' });
    const auth = new AuthService(
      { user: { findFirst, findUniqueOrThrow } } as unknown as PrismaService,
      { signAsync: vi.fn().mockResolvedValue('jwt') } as unknown as JwtService,
    );
    const result = await auth.login({
      identifier: ' DEMO@EXAMPLE.TEST ',
      password: 'ExamplePassword123!',
    });
    expect(findFirst.mock.calls[0][0].where.OR[0].email).toBe(
      'demo@example.test',
    );
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.accessToken).toBe('jwt');
  });
});
