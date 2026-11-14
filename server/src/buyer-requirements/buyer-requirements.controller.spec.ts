import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BuyerRequirementsController } from './buyer-requirements.controller.js';
import { BuyerRequirementsService } from './buyer-requirements.service.js';
import type { Actor } from '../common/security.js';

describe('BuyerRequirementsController', () => {
  let controller: BuyerRequirementsController;
  let mockService: any;

  const mockActor: Actor = {
    id: 'user-uuid-1',
    role: 'BUYER',
    buyerId: 'buyer-uuid-1',
  };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: 'req-1', productName: 'Onions' }),
      list: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      listMy: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      detail: vi.fn().mockResolvedValue({ id: 'req-1', productName: 'Onions' }),
      update: vi.fn().mockResolvedValue({ id: 'req-1', status: 'FULFILLED' }),
      delete: vi.fn().mockResolvedValue({ message: 'Buyer requirement deleted successfully' }),
    };
    controller = new BuyerRequirementsController(
      mockService as unknown as BuyerRequirementsService,
    );
  });

  it('delegates create to service', async () => {
    const input: any = {
      productName: 'Onions',
      category: 'Vegetables',
      quantity: '100',
      unit: 'kg',
      location: 'Kochi',
      description: 'Need onions',
    };
    const res = await controller.create(mockActor, input);
    expect(res).toEqual({ id: 'req-1', productName: 'Onions' });
    expect(mockService.create).toHaveBeenCalledWith(mockActor, input);
  });

  it('delegates list to service', async () => {
    const query: any = { page: 1, limit: 10, category: 'Vegetables' };
    await controller.list(query);
    expect(mockService.list).toHaveBeenCalledWith(query);
  });

  it('delegates listMy to service', async () => {
    const query: any = { page: 1, limit: 10 };
    await controller.listMy(mockActor, query);
    expect(mockService.listMy).toHaveBeenCalledWith(mockActor, query);
  });

  it('delegates detail to service', async () => {
    await controller.detail('req-1');
    expect(mockService.detail).toHaveBeenCalledWith('req-1');
  });

  it('delegates update to service', async () => {
    const input: any = { status: 'FULFILLED' };
    await controller.update(mockActor, 'req-1', input);
    expect(mockService.update).toHaveBeenCalledWith(mockActor, 'req-1', input);
  });

  it('delegates delete to service', async () => {
    await controller.remove(mockActor, 'req-1');
    expect(mockService.delete).toHaveBeenCalledWith(mockActor, 'req-1');
  });
});
