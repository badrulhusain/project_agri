import { validateEnvironment } from './config.js';

describe('environment validation', () => {
  const base = {
    DATABASE_URL: 'postgresql://example:example@localhost:5432/test',
    JWT_SECRET: 'a'.repeat(48),
  };
  it('requires database and a non-placeholder JWT secret', () => {
    expect(() => validateEnvironment({})).toThrow('DATABASE_URL');
    expect(() =>
      validateEnvironment({ DATABASE_URL: base.DATABASE_URL }),
    ).toThrow('JWT_SECRET');
  });
  it('defaults backend to port 3001 and normalizes allowed origins', () => {
    const result = validateEnvironment({
      ...base,
      CLIENT_URL: 'http://localhost:3000, https://example.test',
    });
    expect(result.PORT).toBe(3001);
    expect(result.CLIENT_URL).toBe(
      'http://localhost:3000,https://example.test',
    );
  });
  it('rejects invalid ports, durations, and wildcard CORS', () => {
    expect(() => validateEnvironment({ ...base, PORT: 70000 })).toThrow('PORT');
    expect(() =>
      validateEnvironment({ ...base, JWT_EXPIRES_IN: 'forever' }),
    ).toThrow('JWT_EXPIRES_IN');
    expect(() => validateEnvironment({ ...base, CLIENT_URL: '*' })).toThrow(
      'CLIENT_URL',
    );
  });
});
