import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateProductDto,
  UpdateProductDto,
  quantityPattern,
  pricePattern,
} from './products.dto.js';
import { RegisterDto } from '../auth/auth.dto.js';

describe('boundary validation', () => {
  it.each([
    '0',
    '-1',
    '1e3',
    '1.0001',
    '1\n',
    'NaN',
    '100000000000',
    '.5',
    ' 1',
  ])('rejects unsafe quantity %j', (value) => {
    expect(quantityPattern.test(value)).toBe(false);
  });
  it.each(['500', '0.001', '1.25', '99999999999.999'])(
    'accepts quantity %s',
    (value) => {
      expect(quantityPattern.test(value)).toBe(true);
    },
  );
  it.each(['0', '0.001', '1e2', '10000000000', '2\n'])(
    'rejects unsafe price %j',
    (value) => {
      expect(pricePattern.test(value)).toBe(false);
    },
  );
  it('rejects assigning protected fields and zero stock at creation', async () => {
    const input = plainToInstance(CreateProductDto, {
      name: 'Tomatoes',
      category: 'Vegetables',
      description: 'Fresh',
      unit: 'kg',
      pricePerUnit: '25',
      location: 'Demo',
      quantity: '0',
      farmerId: 'other',
    });
    const errors = await validate(input, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.map((e) => e.property)).toEqual(
      expect.arrayContaining(['quantity', 'farmerId']),
    );
  });
  it('rejects null fields and manual stock edits in patch requests', async () => {
    const input = plainToInstance(UpdateProductDto, {
      name: null,
      images: null,
      availableQuantity: '999',
    });
    const errors = await validate(input, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.map((e) => e.property)).toEqual(
      expect.arrayContaining(['name', 'images', 'availableQuantity']),
    );
  });
  it('rejects public administrator registration', async () => {
    const input = plainToInstance(RegisterDto, {
      name: 'Test Admin',
      email: 'TEST@EXAMPLE.TEST',
      password: 'DemoPassword123!',
      role: 'ADMIN',
    });
    expect(input.email).toBe('test@example.test');
    expect((await validate(input)).some((e) => e.property === 'role')).toBe(
      true,
    );
  });
});
