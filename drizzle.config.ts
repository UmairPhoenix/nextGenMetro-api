import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

// Parse the DATABASE_URL to extract connection details
const databaseUrl = new URL(process.env.DATABASE_URL!);

export default {
  dialect: 'postgresql',
  schema: './src/models/schema.ts',
  out: './migrations',
  dbCredentials: {
    host: databaseUrl.hostname,
    port: parseInt(databaseUrl.port) || 5432,
    user: databaseUrl.username,
    password: databaseUrl.password,
    database: databaseUrl.pathname.slice(1),
    ssl: false,
  },
} satisfies Config;