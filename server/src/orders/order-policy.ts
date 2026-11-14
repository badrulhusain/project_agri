import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { OrderStatus } from '@prisma/client';
import type { Actor } from '../common/security.js';

export function authorizeTransition(
  actor: Actor,
  order: { buyerId: string; farmerId: string; status: OrderStatus },
  target: OrderStatus,
) {
  const buyerCancellation =
    target === 'CANCELLED' &&
    actor.role === 'BUYER' &&
    actor.buyerId === order.buyerId;
  const farmerAction =
    target !== 'CANCELLED' &&
    actor.role === 'FARMER' &&
    actor.farmerId === order.farmerId;
  if (!buyerCancellation && !farmerAction)
    throw new ForbiddenException('You cannot change this order');
  const legal: Partial<Record<OrderStatus, OrderStatus[]>> = {
    PENDING: ['CONFIRMED', 'CANCELLED', 'REJECTED'],
    CONFIRMED: ['COMPLETED'],
  };
  if (!legal[order.status]?.includes(target))
    throw new ConflictException(`Cannot change ${order.status} to ${target}`);
}
