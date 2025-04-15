import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

// Specify correct type instead of 'any'
export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export default pool;
