import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  // Keep migration traffic on a direct/session connection when runtime is pooled.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || '' },
});
