import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WishlistService } from './wishlist.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/security.js';

describe('WishlistService', () => {
  let service: WishlistService;
  let mockPrisma: any;

  const mockActor: Actor = {
    id: 'user-uuid-1',
    role: 'BUYER',
    buyerId: 'buyer-uuid-1',
  };

  const mockProduct = {
    id: 'prod-uuid-1',
    farmerId: 'farmer-uuid-1',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    description: 'Farm fresh red tomatoes',
    quantity: new Prisma.Decimal('500.000'),
    availableQuantity: new Prisma.Decimal('500.000'),
    unit: 'kg',
    pricePerUnit: new Prisma.Decimal('25.00'),
    location: 'Coimbatore',
    images: ['https://example.com/tomato.jpg'],
    status: 'AVAILABLE',
    createdAt: new Date('2026-11-14T10:00:00.000Z'),
    updatedAt: new Date('2026-11-14T10:00:00.000Z'),
    farmer: {
      id: 'farmer-uuid-1',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      user: {
        name: 'Murugan',
        phone: '9876543210',
      },
    },
  };

  const mockWishlistItem = {
    id: 'wish-uuid-1',
    userId: 'user-uuid-1',
    productId: 'prod-uuid-1',
    createdAt: new Date('2026-11-14T11:00:00.000Z'),
    product: mockProduct,
  };

  beforeEach(() => {
    mockPrisma = {
      product: {
        findUnique: vi.fn(),
      },
      wishlistItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new WishlistService(mockPrisma as unknown as PrismaService);
  });

  describe('list', () => {
    it('returns wishlisted products for the current user', async () => {
      mockPrisma.wishlistItem.findMany.mockResolvedValue([mockWishlistItem]);

      const result = await service.list(mockActor);

      expect(mockPrisma.wishlistItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('prod-uuid-1');
      expect(result[0].name).toBe('Fresh Tomatoes');
      expect(result[0].pricePerUnit).toBe('25');
      expect(result[0].product.name).toBe('Fresh Tomatoes');
    });
  });

  describe('add', () => {
    it('adds product to wishlist via upsert', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.wishlistItem.upsert.mockResolvedValue(mockWishlistItem);

      const result = await service.add(mockActor, 'prod-uuid-1');

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-1' },
      });
      expect(mockPrisma.wishlistItem.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user-uuid-1',
            productId: 'prod-uuid-1',
          },
        },
        create: {
          userId: 'user-uuid-1',
          productId: 'prod-uuid-1',
        },
        update: {},
        include: expect.any(Object),
      });
      expect(result.productId).toBe('prod-uuid-1');
      expect(result.message).toBe('Product added to wishlist');
    });

    it('throws NotFoundException if product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.add(mockActor, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes product from user wishlist', async () => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue(mockWishlistItem);
      mockPrisma.wishlistItem.delete.mockResolvedValue(mockWishlistItem);

      const result = await service.remove(mockActor, 'prod-uuid-1');

      expect(mockPrisma.wishlistItem.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user-uuid-1',
            productId: 'prod-uuid-1',
          },
        },
      });
      expect(result).toEqual({ message: 'Product removed from wishlist' });
    });

    it('throws NotFoundException if item not in wishlist', async () => {
      mockPrisma.wishlistItem.findUnique.mockResolvedValue(null);

      await expect(service.remove(mockActor, 'prod-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
