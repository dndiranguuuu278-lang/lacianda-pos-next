import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Neon's serverless driver needs a WebSocket constructor outside edge/browser runtimes.
neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;

if (!process.env.DATABASE_URL) {
  console.warn(
    '[db] DATABASE_URL is not set. API routes that touch the database will fail until you set it (see .env.example).'
  );
}

// Reuse a single pool across hot-reloads in dev so we don't leak connections.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool =
  process.env.DATABASE_URL
    ? globalForDb.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
    : null;

if (process.env.NODE_ENV !== 'production' && pool) {
  globalForDb.pgPool = pool;
}

export async function query<T = any>(text: string, params: unknown[] = []): Promise<{ rows: T[] }> {
  if (!pool) throw new Error('DATABASE_URL is not configured');
  return pool.query(text, params) as unknown as Promise<{ rows: T[] }>;
}
