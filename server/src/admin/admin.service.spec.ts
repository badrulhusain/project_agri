import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('AdminService', () => {
  let service: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn((promises) => Promise.all(promises)),
      user: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      product: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
      scheme: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      surplusAlert: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new AdminService(mockPrisma as unknown as PrismaService);
  });

  describe('getOverview', () => {
    it('aggregates counts and recent activity', async () => {
      mockPrisma.user.count.mockResolvedValueOnce(10).mockResolvedValueOnce(6).mockResolvedValueOnce(3);
      mockPrisma.product.count.mockResolvedValueOnce(5);
      mockPrisma.order.count.mockResolvedValueOnce(4).mockResolvedValueOnce(1).mockResolvedValueOnce(2);
      mockPrisma.scheme.count.mockResolvedValueOnce(2);
      mockPrisma.surplusAlert.count.mockResolvedValueOnce(1);

      const now = new Date();
      mockPrisma.order.findMany.mockResolvedValueOnce([
        { id: 'o1', orderNumber: 'ord-12345678', totalAmount: '500.00', status: 'PENDING', createdAt: now },
      ]);
      mockPrisma.product.findMany.mockResolvedValueOnce([
        { id: 'p1', name: 'Tomatoes', category: 'Vegetables', pricePerUnit: '25.00', unit: 'kg', createdAt: now },
      ]);
      mockPrisma.user.findMany.mockResolvedValueOnce([
        { id: 'u1', name: 'Ravi', role: 'FARMER', createdAt: now },
      ]);
      mockPrisma.scheme.findMany.mockResolvedValueOnce([
        { id: 's1', name: 'PM-KISAN', status: 'PUBLISHED', createdAt: now },
      ]);

      const result = await service.getOverview();

      expect(result.totalUsers).toBe(10);
      expect(result.farmers).toBe(6);
      expect(result.buyers).toBe(3);
      expect(result.activeProducts).toBe(5);
      expect(result.totalOrders).toBe(4);
      expect(result.pendingOrders).toBe(1);
      expect(result.completedOrders).toBe(2);
      expect(result.publishedSchemes).toBe(2);
      expect(result.openSurplus).toBe(1);
      expect(result.recentActivity.length).toBe(4);
    });
  });

  describe('getUsers', () => {
    it('returns paginated users without passwordHash', async () => {
      const users = [
        { id: 'u1', name: 'Farmer 1', email: 'f1@example.com', phone: '+919999900001', role: 'FARMER', isActive: true, createdAt: new Date() },
      ];
      mockPrisma.user.findMany.mockResolvedValueOnce(users);
      mockPrisma.user.count.mockResolvedValueOnce(1);

      const result = await service.getUsers({ page: 1, limit: 10, role: 'FARMER' } as any);

      expect(result.items).toEqual(users);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('updateUserStatus', () => {
    it('updates user isActive flag', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1' });
      mockPrisma.user.update.mockResolvedValueOnce({
        id: 'u1',
        name: 'Farmer 1',
        isActive: false,
      });

      const result = await service.updateUserStatus('u1', false);
      expect(result.isActive).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { isActive: false } }),
      );
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateUserStatus('u-none', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('schemes', () => {
    it('creates a scheme', async () => {
      const input = {
        name: 'New Scheme',
        description: 'New Scheme Description',
        benefits: '5000 subsidy',
        status: 'PUBLISHED' as const,
      };
      mockPrisma.scheme.create.mockResolvedValueOnce({ id: 's1', ...input });

      const result = await service.createScheme(input);
      expect(result.id).toBe('s1');
      expect(mockPrisma.scheme.create).toHaveBeenCalled();
    });

    it('updates a scheme', async () => {
      mockPrisma.scheme.findUnique.mockResolvedValueOnce({ id: 's1' });
      mockPrisma.scheme.update.mockResolvedValueOnce({ id: 's1', name: 'Updated Scheme' });

      const result = await service.updateScheme('s1', { name: 'Updated Scheme' });
      expect(result.name).toBe('Updated Scheme');
    });

    it('throws NotFoundException on missing scheme update', async () => {
      mockPrisma.scheme.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateScheme('s-none', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSettings', () => {
    it('returns platform config object', () => {
      const settings = service.getSettings();
      expect(settings.platformName).toBeDefined();
      expect(settings.currency).toBe('INR');
      expect(settings.allowedCategories.length).toBeGreaterThan(0);
      expect(settings.features.schemes).toBe(true);
    });
  });
});
