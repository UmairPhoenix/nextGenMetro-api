import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './models/schema';
import { logger } from './middleware/logging';
import 'dotenv/config';

let db: ReturnType<typeof drizzle>;

export async function connectToDB() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
    db = drizzle(pool, { schema });
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error:', { error: (error as Error).message });
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
