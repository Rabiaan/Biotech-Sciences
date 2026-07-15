/**
 * Client-side config (Vite env). Server code should use config.server.js.
 */

export function getSupabaseUrl() {
  return import.meta.env.VITE_SUPABASE_URL || null;
}

export function getSupabaseAnonKey() {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || null;
}
