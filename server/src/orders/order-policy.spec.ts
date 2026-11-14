import { ConflictException, ForbiddenException } from '@nestjs/common';
import { authorizeTransition } from './order-policy.js';
import type { Actor } from '../common/security.js';
import type { OrderStatus } from '@prisma/client';

const farmer: Actor = { id: 'farmer-user', role: 'FARMER', farmerId: 'farmer' };
const buyer: Actor = { id: 'buyer-user', role: 'BUYER', buyerId: 'buyer' };
const order = {
  farmerId: 'farmer',
  buyerId: 'buyer',
  status: 'PENDING' as OrderStatus,
};

describe('order transition authorization', () => {
  it.each(['CONFIRMED', 'REJECTED'] as const)(
    'allows owner farmer to set %s on pending orders',
    (target) => {
      expect(() => authorizeTransition(farmer, order, target)).not.toThrow();
    },
  );
  it('allows completion only after confirmation', () => {
    expect(() =>
      authorizeTransition(
        farmer,
        { ...order, status: 'CONFIRMED' },
        'COMPLETED',
      ),
    ).not.toThrow();
    expect(() => authorizeTransition(farmer, order, 'COMPLETED')).toThrow(
      ConflictException,
    );
  });
  it('permits buyer cancellation only while pending', () => {
    expect(() => authorizeTransition(buyer, order, 'CANCELLED')).not.toThrow();
    expect(() =>
      authorizeTransition(
        buyer,
        { ...order, status: 'CONFIRMED' },
        'CANCELLED',
      ),
    ).toThrow(ConflictException);
  });
  it('rejects foreign buyers and farmers and admin impersonation', () => {
    expect(() =>
      authorizeTransition({ ...buyer, buyerId: 'other' }, order, 'CANCELLED'),
    ).toThrow(ForbiddenException);
    expect(() =>
      authorizeTransition({ ...farmer, farmerId: 'other' }, order, 'CONFIRMED'),
    ).toThrow(ForbiddenException);
    expect(() =>
      authorizeTransition({ id: 'admin', role: 'ADMIN' }, order, 'CONFIRMED'),
    ).toThrow(ForbiddenException);
  });
  it('prevents farmers cancelling and buyers confirming', () => {
    expect(() => authorizeTransition(farmer, order, 'CANCELLED')).toThrow(
      ForbiddenException,
    );
    expect(() => authorizeTransition(buyer, order, 'CONFIRMED')).toThrow(
      ForbiddenException,
    );
  });
  it.each(['CANCELLED', 'REJECTED', 'COMPLETED'] as const)(
    'keeps %s terminal',
    (status) => {
      expect(() =>
        authorizeTransition(buyer, { ...order, status }, 'CANCELLED'),
      ).toThrow(ConflictException);
      expect(() =>
        authorizeTransition(farmer, { ...order, status }, 'CONFIRMED'),
      ).toThrow(ConflictException);
    },
  );
});
