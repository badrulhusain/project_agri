import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function fixture(
  options: {
    public?: boolean;
    roles?: string[];
    header?: string;
    active?: boolean;
    role?: string;
    invalid?: boolean;
  } = {},
) {
  const reflector = {
    getAllAndOverride: vi.fn((key: string) =>
      key === 'public' ? options.public : options.roles,
    ),
  };
  const verifyAsync = options.invalid
    ? vi.fn().mockRejectedValue(new Error('invalid'))
    : vi
        .fn()
        .mockResolvedValue({ sub: 'a0000000-0000-4000-8000-000000000001' });
  const findUnique = vi
    .fn()
    .mockResolvedValue({
      id: 'user',
      role: options.role ?? 'BUYER',
      isActive: options.active ?? true,
      buyerProfile: { id: 'buyer' },
    });
  const request = { headers: { authorization: options.header } };
  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const guard = new AuthGuard(
    reflector as unknown as Reflector,
    { verifyAsync } as unknown as JwtService,
    { user: { findUnique } } as unknown as PrismaService,
  );
  return { guard, context, request, verifyAsync, findUnique };
}

describe('global authentication and role guard', () => {
  it('allows public endpoints without token or user queries', async () => {
    const f = fixture({ public: true });
    expect(await f.guard.canActivate(f.context)).toBe(true);
    expect(f.findUnique).not.toHaveBeenCalled();
  });
  it('rejects missing and malformed bearer credentials', async () => {
    for (const header of [undefined, 'Basic x', 'Bearer', 'Bearer x y']) {
      const f = fixture({ header });
      await expect(f.guard.canActivate(f.context)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(f.findUnique).not.toHaveBeenCalled();
    }
  });
  it('rejects invalid signatures before querying identity', async () => {
    const f = fixture({ header: 'Bearer invalid', invalid: true });
    await expect(f.guard.canActivate(f.context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(f.findUnique).not.toHaveBeenCalled();
  });
  it('checks the current account status rather than trusting token claims', async () => {
    const f = fixture({ header: 'Bearer signed', active: false });
    await expect(f.guard.canActivate(f.context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('rejects forbidden roles and populates the actor for allowed roles', async () => {
    const forbidden = fixture({ header: 'Bearer signed', roles: ['FARMER'] });
    await expect(
      forbidden.guard.canActivate(forbidden.context),
    ).rejects.toBeInstanceOf(ForbiddenException);
    const allowed = fixture({ header: 'Bearer signed', roles: ['BUYER'] });
    expect(await allowed.guard.canActivate(allowed.context)).toBe(true);
    expect(allowed.request).toHaveProperty('user.buyerId', 'buyer');
  });
});
