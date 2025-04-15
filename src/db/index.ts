import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
