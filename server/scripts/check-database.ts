import 'dotenv/config';
import { lookup } from 'node:dns/promises';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is missing. Configure server/.env using .env.example.',
  );
  process.exit(1);
}
if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL)) {
  console.error(
    'DATABASE_URL must be a PostgreSQL URI from Supabase Connect -> Session pooler, not the HTTPS API URL or an API key.',
  );
  process.exit(1);
}
let hostname: string;
try {
  hostname = new URL(process.env.DATABASE_URL).hostname;
} catch {
  console.error(
    'DATABASE_URL is not a valid URI. Copy the PostgreSQL URI from Supabase Connect and URL-encode special characters in the password.',
  );
  process.exit(1);
}
try {
  await lookup(hostname);
} catch {
  console.error(
    hostname.startsWith('db.') && hostname.endsWith('.supabase.co')
      ? 'The Supabase direct endpoint cannot resolve on this network. Use Connect -> Session pooler (port 5432) and copy its exact host and username into DATABASE_URL.'
      : 'The database hostname cannot resolve. Check the exact hostname in DATABASE_URL and your network DNS.',
  );
  process.exit(1);
}
const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  }),
});
try {
  await db.$queryRaw`SELECT 1`;
  console.log('PostgreSQL connection succeeded.');
} catch {
  console.error(
    'PostgreSQL connection failed. Check DATABASE_URL, network access, SSL, and database credentials. No credentials were printed.',
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
