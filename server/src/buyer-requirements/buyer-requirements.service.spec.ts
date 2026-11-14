import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BuyerRequirementsService } from './buyer-requirements.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/security.js';

describe('BuyerRequirementsService', () => {
  let service: BuyerRequirementsService;
  let mockPrisma: any;

  const mockBuyer = {
    id: 'buyer-uuid-1',
    businessName: 'Green Supermarket',
    state: 'Kerala',
    district: 'Ernakulam',
    address: 'Kalamassery',
    user: {
      id: 'user-uuid-1',
      name: 'Rajesh Kumar',
      phone: '9847123456',
      email: 'buyer@example.com',
    },
  };

  const mockRequirement = {
    id: 'req-uuid-1',
    buyerId: 'buyer-uuid-1',
    productName: 'Fresh Red Onions',
    category: 'Vegetables',
    quantity: new Prisma.Decimal('1500.000'),
    unit: 'kg',
    targetPrice: new Prisma.Decimal('28.00'),
    neededBy: 'Within 3 days',
    urgency: 'URGENT',
    location: 'Ernakulam, Kerala',
    deliveryAddress: 'Central Warehouse, Kalamassery',
    description: 'Seeking medium-to-large sorted red onions.',
    status: 'OPEN',
    createdAt: new Date('2026-11-14T10:00:00.000Z'),
    updatedAt: new Date('2026-11-14T10:00:00.000Z'),
    buyer: mockBuyer,
  };

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn((promises) => Promise.all(promises)),
      buyerProfile: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      buyerRequirement: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new BuyerRequirementsService(
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('creates a buyer requirement with active buyer profile', async () => {
      const actor: Actor = {
        id: 'user-uuid-1',
        role: 'BUYER',
        buyerId: 'buyer-uuid-1',
      };
      mockPrisma.buyerRequirement.create.mockResolvedValue(mockRequirement);

      const result = await service.create(actor, {
        productName: 'Fresh Red Onions',
        category: 'Vegetables',
        quantity: '1500',
        unit: 'kg',
        targetPrice: '28.00',
        neededBy: 'Within 3 days',
        urgency: 'URGENT',
        location: 'Ernakulam, Kerala',
        deliveryAddress: 'Central Warehouse, Kalamassery',
        description: 'Seeking medium-to-large sorted red onions.',
      });

      expect(mockPrisma.buyerRequirement.create).toHaveBeenCalled();
      expect(result.id).toBe('req-uuid-1');
      expect(result.productName).toBe('Fresh Red Onions');
      expect(result.quantity).toBe('1500');
      expect(result.buyerName).toBe('Rajesh Kumar');
      expect(result.phone).toBe('9847123456');
    });

    it('creates missing buyer profile if role is BUYER', async () => {
      const actor: Actor = {
        id: 'user-uuid-1',
        role: 'BUYER',
      };
      mockPrisma.buyerProfile.findUnique.mockResolvedValue(null);
      mockPrisma.buyerProfile.create.mockResolvedValue({ id: 'buyer-uuid-auto' });
      mockPrisma.buyerRequirement.create.mockResolvedValue({
        ...mockRequirement,
        buyerId: 'buyer-uuid-auto',
      });

      const result = await service.create(actor, {
        productName: 'Fresh Red Onions',
        category: 'Vegetables',
        quantity: '1500',
        unit: 'kg',
        location: 'Ernakulam, Kerala',
        description: 'Seeking medium-to-large sorted red onions.',
      });

      expect(mockPrisma.buyerProfile.create).toHaveBeenCalledWith({
        data: { userId: 'user-uuid-1' },
        select: { id: true },
      });
      expect(result.buyerId).toBe('buyer-uuid-auto');
    });

    it('throws ForbiddenException if non-buyer tries to create', async () => {
      const actor: Actor = {
        id: 'user-uuid-2',
        role: 'FARMER',
      };
      mockPrisma.buyerProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.create(actor, {
          productName: 'Fresh Red Onions',
          category: 'Vegetables',
          quantity: '1500',
          unit: 'kg',
          location: 'Ernakulam',
          description: 'Looking for red onions',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('list', () => {
    it('lists open requirements with pagination', async () => {
      mockPrisma.buyerRequirement.findMany.mockResolvedValue([mockRequirement]);
      mockPrisma.buyerRequirement.count.mockResolvedValue(1);

      const result = await service.list({
        page: 1,
        limit: 10,
        search: 'onions',
        category: 'Vegetables',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].productName).toBe('Fresh Red Onions');
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('listMy', () => {
    it('lists requirements for the authenticated buyer', async () => {
      const actor: Actor = {
        id: 'user-uuid-1',
        role: 'BUYER',
        buyerId: 'buyer-uuid-1',
      };
      mockPrisma.buyerRequirement.findMany.mockResolvedValue([mockRequirement]);
      mockPrisma.buyerRequirement.count.mockResolvedValue(1);

      const result = await service.listMy(actor, { page: 1, limit: 10 });

      expect(mockPrisma.buyerRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { buyerId: 'buyer-uuid-1' },
        }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('updates status when caller is the owner', async () => {
      const actor: Actor = {
        id: 'user-uuid-1',
        role: 'BUYER',
        buyerId: 'buyer-uuid-1',
      };
      mockPrisma.buyerRequirement.findUnique.mockResolvedValue({
        id: 'req-uuid-1',
        buyerId: 'buyer-uuid-1',
      });
      mockPrisma.buyerRequirement.update.mockResolvedValue({
        ...mockRequirement,
        status: 'FULFILLED',
      });

      const result = await service.update(actor, 'req-uuid-1', {
        status: 'FULFILLED',
      });

      expect(result.status).toBe('FULFILLED');
    });

    it('throws NotFoundException if requirement does not exist', async () => {
      const actor: Actor = {
        id: 'user-uuid-1',
        role: 'BUYER',
        buyerId: 'buyer-uuid-1',
      };
      mockPrisma.buyerRequirement.findUnique.mockResolvedValue(null);

      await expect(
        service.update(actor, 'non-existent', { status: 'FULFILLED' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if caller is not the owner', async () => {
      const actor: Actor = {
        id: 'user-uuid-2',
        role: 'BUYER',
        buyerId: 'buyer-uuid-2',
      };
      mockPrisma.buyerRequirement.findUnique.mockResolvedValue({
        id: 'req-uuid-1',
        buyerId: 'buyer-uuid-1',
      });

      await expect(
        service.update(actor, 'req-uuid-1', { status: 'CLOSED' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('deletes requirement when caller is the owner', async () => {
      const actor: Actor = {
        id: 'user-uuid-1',
        role: 'BUYER',
        buyerId: 'buyer-uuid-1',
      };
      mockPrisma.buyerRequirement.findUnique.mockResolvedValue({
        id: 'req-uuid-1',
        buyerId: 'buyer-uuid-1',
      });
      mockPrisma.buyerRequirement.delete.mockResolvedValue(mockRequirement);

      const result = await service.delete(actor, 'req-uuid-1');
      expect(result).toEqual({
        message: 'Buyer requirement deleted successfully',
      });
      expect(mockPrisma.buyerRequirement.delete).toHaveBeenCalledWith({
        where: { id: 'req-uuid-1' },
      });
    });

    it('throws ForbiddenException if non-owner tries to delete', async () => {
      const actor: Actor = {
        id: 'user-uuid-2',
        role: 'BUYER',
        buyerId: 'buyer-uuid-2',
      };
      mockPrisma.buyerRequirement.findUnique.mockResolvedValue({
        id: 'req-uuid-1',
        buyerId: 'buyer-uuid-1',
      });

      await expect(service.delete(actor, 'req-uuid-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
