import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Reflector } from '@nestjs/core';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

describe('AdminController', () => {
  let controller: AdminController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getOverview: vi.fn().mockResolvedValue({ totalUsers: 10 }),
      getUsers: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      updateUserStatus: vi.fn().mockResolvedValue({ id: 'u1', isActive: false }),
      getProducts: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      updateProductStatus: vi.fn().mockResolvedValue({ id: 'p1', status: 'INACTIVE' }),
      getOrders: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      getSchemes: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      createScheme: vi.fn().mockResolvedValue({ id: 's1', name: 'Scheme 1' }),
      updateScheme: vi.fn().mockResolvedValue({ id: 's1', name: 'Scheme 1 Updated' }),
      getSurplus: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      updateSurplusStatus: vi.fn().mockResolvedValue({ id: 'sur1', status: 'RESOLVED' }),
      getSettings: vi.fn().mockReturnValue({ platformName: 'KrishiSetu' }),
    };

    controller = new AdminController(mockService as unknown as AdminService);
  });

  it('delegates overview to service', async () => {
    const res = await controller.overview();
    expect(res).toEqual({ totalUsers: 10 });
    expect(mockService.getOverview).toHaveBeenCalled();
  });

  it('delegates users query to service', async () => {
    const query = { page: 1, limit: 10 };
    await controller.users(query as any);
    expect(mockService.getUsers).toHaveBeenCalledWith(query);
  });

  it('delegates updateUserStatus to service', async () => {
    await controller.updateUserStatus('u1', { isActive: false });
    expect(mockService.updateUserStatus).toHaveBeenCalledWith('u1', false);
  });

  it('delegates products query to service', async () => {
    const query = { page: 1, limit: 10 };
    await controller.products(query as any);
    expect(mockService.getProducts).toHaveBeenCalledWith(query);
  });

  it('delegates orders query to service', async () => {
    const query = { page: 1, limit: 10 };
    await controller.orders(query as any);
    expect(mockService.getOrders).toHaveBeenCalledWith(query);
  });

  it('delegates schemes CRUD to service', async () => {
    const query = { page: 1, limit: 10 };
    await controller.schemes(query as any);
    expect(mockService.getSchemes).toHaveBeenCalledWith(query);

    const body = { name: 'Scheme', description: 'Desc', benefits: 'Ben' };
    await controller.createScheme(body as any);
    expect(mockService.createScheme).toHaveBeenCalledWith(body);

    await controller.updateScheme('s1', { name: 'Updated' });
    expect(mockService.updateScheme).toHaveBeenCalledWith('s1', { name: 'Updated' });
  });

  it('delegates surplus query to service', async () => {
    const query = { page: 1, limit: 10 };
    await controller.surplus(query as any);
    expect(mockService.getSurplus).toHaveBeenCalledWith(query);
  });

  it('delegates settings to service', () => {
    const res = controller.settings();
    expect(res).toEqual({ platformName: 'KrishiSetu' });
    expect(mockService.getSettings).toHaveBeenCalled();
  });

  it('enforces ADMIN role on controller class and methods', () => {
    const reflector = new Reflector();
    const classRoles = reflector.get('roles', AdminController);
    expect(classRoles).toContain('ADMIN');

    const overviewMethod = Reflect.get(
      AdminController.prototype,
      'overview',
    ) as () => unknown;
    const methodRoles = reflector.get('roles', overviewMethod);
    expect(methodRoles).toContain('ADMIN');
  });
});
