/**
 * Supabase Database Connection
 * 
 * Uses postgres.js for direct SQL queries to Supabase
 */

import postgres from 'postgres';

// Support both Node.js (process.env) and Vite (import.meta.env)
const connectionString = 
  typeof process !== 'undefined' && process.env?.DATABASE_URL
    ? process.env.DATABASE_URL
    : (import.meta as any).env?.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not defined. Please add it to your .env file.'
  );
}

const sql = postgres(connectionString);

export default sql;

