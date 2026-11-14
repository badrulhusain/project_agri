import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WishlistController } from './wishlist.controller.js';
import { WishlistService } from './wishlist.service.js';
import type { Actor } from '../common/security.js';

describe('WishlistController', () => {
  let controller: WishlistController;
  let mockService: any;

  const mockActor: Actor = {
    id: 'user-uuid-1',
    role: 'BUYER',
    buyerId: 'buyer-uuid-1',
  };

  beforeEach(() => {
    mockService = {
      list: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Tomatoes' }]),
      add: vi.fn().mockResolvedValue({ id: 'w1', productId: 'p1' }),
      remove: vi.fn().mockResolvedValue({ message: 'Product removed from wishlist' }),
    };
    controller = new WishlistController(
      mockService as unknown as WishlistService,
    );
  });

  it('delegates list to service', async () => {
    const res = await controller.list(mockActor);
    expect(res).toEqual([{ id: 'p1', name: 'Tomatoes' }]);
    expect(mockService.list).toHaveBeenCalledWith(mockActor);
  });

  it('delegates add to service', async () => {
    const res = await controller.add(mockActor, 'p1');
    expect(res).toEqual({ id: 'w1', productId: 'p1' });
    expect(mockService.add).toHaveBeenCalledWith(mockActor, 'p1');
  });

  it('delegates remove to service', async () => {
    const res = await controller.remove(mockActor, 'p1');
    expect(res).toEqual({ message: 'Product removed from wishlist' });
    expect(mockService.remove).toHaveBeenCalledWith(mockActor, 'p1');
  });
});
