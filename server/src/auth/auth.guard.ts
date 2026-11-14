import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@prisma/client';
import type { AuthRequest } from '../common/security.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly db: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>('public', targets))
      return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const header = request.headers.authorization;
    const match =
      typeof header === 'string' ? /^Bearer ([^\s]+)$/i.exec(header) : null;
    if (!match) throw new UnauthorizedException('Bearer token required');
    let sub: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(match[1], {
        algorithms: ['HS256'],
      });
      if (
        typeof payload.sub !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(payload.sub)
      )
        throw new Error('Invalid subject');
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const user = await this.db.user.findUnique({
      where: { id: sub },
      select: {
        id: true,
        role: true,
        isActive: true,
        farmerProfile: { select: { id: true } },
        buyerProfile: { select: { id: true } },
      },
    });
    if (!user?.isActive) throw new UnauthorizedException('Account unavailable');
    request.user = {
      id: user.id,
      role: user.role,
      farmerId: user.farmerProfile?.id,
      buyerId: user.buyerProfile?.id,
    };
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', targets);
    if (roles?.length && !roles.includes(user.role))
      throw new ForbiddenException('Role not permitted');
    return true;
  }
}
