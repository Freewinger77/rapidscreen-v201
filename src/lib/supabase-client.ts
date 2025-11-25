/**
 * Supabase Client for Browser
 * 
 * Browser-compatible client using @supabase/supabase-js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Backend client
const backendUrl = import.meta.env.VITE_BACKEND_SUPABASE_URL;
const backendAnonKey = import.meta.env.VITE_BACKEND_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY; // Use backend key or fallback

if (!backendUrl) {
  console.warn('Missing VITE_BACKEND_SUPABASE_URL');
}

if (!backendAnonKey) {
  console.warn('Missing VITE_BACKEND_SUPABASE_ANON_KEY');
}

export const backendSupabase = backendUrl && backendAnonKey 
  ? createClient(backendUrl, backendAnonKey)
  : null as any;

