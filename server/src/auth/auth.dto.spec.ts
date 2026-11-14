import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './auth.dto.js';

const registration = {
  name: 'Demo Farmer',
  phone: '+919000000001',
  password: 'ExamplePassword123!',
  role: 'FARMER',
};

describe('registration validation', () => {
  it.each([
    undefined,
    null,
    '',
    ' ',
    '1234567',
    '+0123456789',
    '1234567890123456',
    'invalid',
    919000000001,
  ])('rejects missing or invalid phone %j', async (phone) => {
    const input = plainToInstance(RegisterDto, { ...registration, phone });
    expect((await validate(input)).map((error) => error.property)).toContain(
      'phone',
    );
  });

  it.each(['+919000000001', '919000000001'])(
    'accepts phone %s without email',
    async (phone) => {
      const input = plainToInstance(RegisterDto, { ...registration, phone });
      expect(await validate(input)).toEqual([]);
    },
  );

  it('normalizes a supplied email', async () => {
    const input = plainToInstance(RegisterDto, {
      ...registration,
      email: ' DEMO@EXAMPLE.TEST ',
    });
    expect(input.email).toBe('demo@example.test');
    expect(await validate(input)).toEqual([]);
  });

  it.each(['', 'invalid', 'a'.repeat(255) + '@example.test'])(
    'rejects invalid supplied email %j',
    async (email) => {
      const input = plainToInstance(RegisterDto, { ...registration, email });
      expect((await validate(input)).map((error) => error.property)).toContain(
        'email',
      );
    },
  );
});
