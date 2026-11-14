import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';

const path = '.env';
const existing = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
const env = dotenv.parse(existing);
const defaults = {
  PORT: '3001',
  JWT_SECRET: randomBytes(48).toString('hex'),
  JWT_EXPIRES_IN: '1h',
  CLIENT_URL: 'http://localhost:3000',
  DEMO_PASSWORD: `Demo-${randomBytes(18).toString('base64url')}`,
};
const additions = Object.entries(defaults)
  .filter(([key]) => !env[key])
  .map(([key, value]) => `${key}=${value}`);
if (!Object.hasOwn(env, 'DATABASE_URL')) additions.unshift('DATABASE_URL=');
if (additions.length)
  fs.appendFileSync(
    path,
    `${existing.endsWith('\n') || !existing ? '' : '\n'}${additions.join('\n')}\n`,
  );
console.log(
  'server/.env prepared. Existing configured values were preserved. Generated secrets were saved locally and not printed.',
);
if (!env.DATABASE_URL)
  console.log(
    'Set DATABASE_URL to the Supabase Session pooler PostgreSQL URI, including your database password.',
  );
