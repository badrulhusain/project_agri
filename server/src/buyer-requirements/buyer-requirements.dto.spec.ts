import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateBuyerRequirementDto,
  UpdateBuyerRequirementDto,
  BuyerRequirementQueryDto,
} from './buyer-requirements.dto.js';

describe('BuyerRequirements DTOs', () => {
  describe('CreateBuyerRequirementDto', () => {
    it('accepts valid input with all fields', async () => {
      const input = plainToInstance(CreateBuyerRequirementDto, {
        productName: 'Fresh Red Onions',
        category: 'Vegetables',
        quantity: '1500',
        unit: 'kg',
        targetPrice: '28.00',
        neededBy: 'Within 3 days',
        urgency: 'URGENT',
        location: 'Ernakulam, Kerala',
        deliveryAddress: 'Central Warehouse, Kalamassery',
        description: 'Need quality red onions.',
      });
      const errors = await validate(input, { whitelist: true });
      expect(errors.length).toBe(0);
    });

    it('accepts number quantity and converts to string', async () => {
      const input = plainToInstance(CreateBuyerRequirementDto, {
        productName: 'Tomatoes',
        category: 'Vegetables',
        quantity: 500,
        unit: 'kg',
        location: 'Coimbatore',
        description: 'Fresh tomatoes needed',
      });
      const errors = await validate(input, { whitelist: true });
      expect(errors.length).toBe(0);
      expect(input.quantity).toBe('500');
    });

    it('rejects invalid quantity', async () => {
      const input = plainToInstance(CreateBuyerRequirementDto, {
        productName: 'Tomatoes',
        category: 'Vegetables',
        quantity: '-10',
        unit: 'kg',
        location: 'Coimbatore',
        description: 'Fresh tomatoes needed',
      });
      const errors = await validate(input, { whitelist: true });
      expect(errors.some((e) => e.property === 'quantity')).toBe(true);
    });

    it('rejects invalid urgency', async () => {
      const input = plainToInstance(CreateBuyerRequirementDto, {
        productName: 'Tomatoes',
        category: 'Vegetables',
        quantity: '100',
        unit: 'kg',
        location: 'Coimbatore',
        description: 'Fresh tomatoes needed',
        urgency: 'SUPER_URGENT',
      });
      const errors = await validate(input, { whitelist: true });
      expect(errors.some((e) => e.property === 'urgency')).toBe(true);
    });

    it('rejects missing required fields', async () => {
      const input = plainToInstance(CreateBuyerRequirementDto, {});
      const errors = await validate(input, { whitelist: true });
      const props = errors.map((e) => e.property);
      expect(props).toContain('productName');
      expect(props).toContain('category');
      expect(props).toContain('quantity');
      expect(props).toContain('unit');
      expect(props).toContain('location');
      expect(props).toContain('description');
    });
  });

  describe('UpdateBuyerRequirementDto', () => {
    it('accepts status update', async () => {
      const input = plainToInstance(UpdateBuyerRequirementDto, {
        status: 'FULFILLED',
      });
      const errors = await validate(input, { whitelist: true });
      expect(errors.length).toBe(0);
    });

    it('rejects invalid status', async () => {
      const input = plainToInstance(UpdateBuyerRequirementDto, {
        status: 'UNKNOWN_STATUS',
      });
      const errors = await validate(input, { whitelist: true });
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });
  });

  describe('BuyerRequirementQueryDto', () => {
    it('accepts search, category, and urgency filters', async () => {
      const input = plainToInstance(BuyerRequirementQueryDto, {
        search: 'onions',
        category: 'Vegetables',
        urgency: 'HIGH',
        status: 'OPEN',
        page: 2,
        limit: 20,
      });
      const errors = await validate(input, { whitelist: true });
      expect(errors.length).toBe(0);
      expect(input.page).toBe(2);
      expect(input.limit).toBe(20);
    });
  });
});
