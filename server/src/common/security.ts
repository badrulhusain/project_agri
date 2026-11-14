import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Role } from '@prisma/client';

export type Actor = {
  id: string;
  role: Role;
  farmerId?: string;
  buyerId?: string;
};
export type AuthRequest = Request & { user: Actor };
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Actor =>
    ctx.switchToHttp().getRequest<AuthRequest>().user,
);
