import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import {
  AdminUserQueryDto,
  CreateSchemeDto,
  UpdateProductStatusDto,
  UpdateSchemeDto,
  UpdateSurplusStatusDto,
  UpdateUserStatusDto,
} from './admin.dto.js';

describe('AdminUserQueryDto', () => {
  it('accepts valid query parameters and defaults', async () => {
    const dto = plainToInstance(AdminUserQueryDto, {
      page: 2,
      limit: 25,
      role: 'FARMER',
      search: 'Ravi',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('rejects invalid role', async () => {
    const dto = plainToInstance(AdminUserQueryDto, {
      role: 'INVALID_ROLE',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateUserStatusDto', () => {
  it('accepts boolean isActive', async () => {
    const dto = plainToInstance(UpdateUserStatusDto, { isActive: false });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('rejects non-boolean isActive', async () => {
    const dto = plainToInstance(UpdateUserStatusDto, { isActive: 'yes' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('CreateSchemeDto', () => {
  it('validates required fields', async () => {
    const valid = plainToInstance(CreateSchemeDto, {
      name: 'PM-KISAN Scheme',
      description: 'Income support to farmer families',
      benefits: 'Rs. 6000 per year',
      department: 'Agriculture Dept',
      status: 'PUBLISHED',
    });
    const errors = await validate(valid);
    expect(errors.length).toBe(0);
  });

  it('fails if name is too short or empty', async () => {
    const invalid = plainToInstance(CreateSchemeDto, {
      name: ' ',
      description: 'Valid description text',
      benefits: 'Valid benefits text',
    });
    const errors = await validate(invalid);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateSchemeDto', () => {
  it('allows partial fields', async () => {
    const dto = plainToInstance(UpdateSchemeDto, {
      name: 'Updated Scheme Name',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe('UpdateProductStatusDto', () => {
  it('accepts valid product statuses', async () => {
    for (const status of ['AVAILABLE', 'PARTIALLY_SOLD', 'SOLD_OUT', 'INACTIVE']) {
      const dto = plainToInstance(UpdateProductStatusDto, { status });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('rejects invalid product status', async () => {
    const dto = plainToInstance(UpdateProductStatusDto, { status: 'DELETED' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateSurplusStatusDto', () => {
  it('accepts valid surplus statuses', async () => {
    for (const status of ['OPEN', 'RESOLVED', 'CANCELLED']) {
      const dto = plainToInstance(UpdateSurplusStatusDto, { status });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });
});
