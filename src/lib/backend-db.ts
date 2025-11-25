/**
 * Backend Database Connection
 * 
 * Connects to the backend database that tracks real-time
 * campaign interactions, calls, and WhatsApp conversations
 */

import postgres from 'postgres';

// Support both Node.js (process.env) and Vite (import.meta.env)
const connectionString = 
  typeof process !== 'undefined' && process.env?.BACKEND_DATABASE_URL
    ? process.env.BACKEND_DATABASE_URL
    : (import.meta as any).env?.BACKEND_DATABASE_URL || (import.meta as any).env?.VITE_BACKEND_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'BACKEND_DATABASE_URL is not defined. Please add it to your .env file.'
  );
}

const backendSql = postgres(connectionString);

export default backendSql;

