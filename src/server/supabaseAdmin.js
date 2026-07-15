import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "../lib/config.server.js";

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

let adminClient = null;

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();
  if (!url || !serviceKey) return null;
  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return adminClient;
}

export async function verifyAccessToken(token) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!getSupabaseUrl() || !anonKey) return { user: null, error: "Auth not configured" };
    const client = createClient(getSupabaseUrl(), anonKey);
    const { data, error } = await client.auth.getUser(token);
    return { user: data?.user ?? null, error: error?.message ?? null };
  }
  const { data, error } = await admin.auth.getUser(token);
  return { user: data?.user ?? null, error: error?.message ?? null };
}
