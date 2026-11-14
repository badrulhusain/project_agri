export function validateEnvironment(env: Record<string, unknown>) {
  const text = (key: string, fallback = '') =>
    typeof env[key] === 'string' ? env[key] : fallback;
  const database = text('DATABASE_URL');
  if (!/^postgres(ql)?:\/\//.test(database))
    throw new Error('Set DATABASE_URL to a PostgreSQL connection URL');
  const secret = text('JWT_SECRET');
  if (secret.length < 32 || /REPLACE|CHANGE_ME/.test(secret))
    throw new Error(
      'JWT_SECRET must be a random secret of at least 32 characters',
    );
  const expires = text('JWT_EXPIRES_IN', '1h');
  if (!/^\d+(s|m|h|d)$/.test(expires))
    throw new Error('JWT_EXPIRES_IN must be a duration such as 1h');
  const port = Number(env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid PORT');
  const origins = text('CLIENT_URL', 'http://localhost:3000')
    .split(',')
    .map((v) => v.trim());
  if (origins.some((v) => !/^https?:\/\/[^/]+$/.test(v)))
    throw new Error('CLIENT_URL must contain comma-separated HTTP origins');
  return {
    ...env,
    DATABASE_URL: database,
    JWT_SECRET: secret,
    JWT_EXPIRES_IN: expires,
    PORT: port,
    CLIENT_URL: origins.join(','),
  };
}
