/**
 * Server-only config (process.env). Do not import from client bundles.
 */

export function getSupabaseUrl() {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL;
  const host = process.env.SQL_HOST;
  if (host?.includes("supabase.co")) {
    const projectRef = host.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
    return `https://${projectRef}.supabase.co`;
  }
  return null;
}

export function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || null;
}

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "admin@biotechsciences.com";
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
