import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); dotenv.config();

import { createClient } from "@supabase/supabase-js";

// Creates the admin account from server-side env vars using the service-role
// key, then forces role = 'admin' on the public.users row. Never prints the
// password. Run once: node scripts/createAdmin.js

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_SEED_EMAIL;
const password = process.env.ADMIN_SEED_PASSWORD;

if (!url || !serviceRole) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!email || !password) {
  console.error("Missing ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function createAdmin() {
  // 1) Find existing or create the auth user.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw new Error(`listUsers: ${listErr.message}`);

  let userId = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;

  if (!userId) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "Admin", full_name: "Admin" },
      app_metadata: { role: "admin", display_name: "Admin" }
    });
    if (createErr) throw new Error(`createUser: ${createErr.message}`);
    userId = created.user.id;
    console.log(`Created auth user for ${email}`);
  } else {
    // Ensure the password is set/refreshed and email is confirmed.
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      app_metadata: { role: "admin", display_name: "Admin" }
    });
    if (updErr) throw new Error(`updateUser: ${updErr.message}`);
    console.log(`Auth user already exists for ${email} (password refreshed)`);
  }

  // 2) Force role = 'admin' on the public.users profile row (best-effort:
  //    the auth user's app_metadata.role is the authoritative signal used for
  //    the admin redirect, so don't fail the script if RLS/grants block this).
  const { error: roleErr } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("id", userId);
  if (roleErr) {
    console.log(`(note) could not set role on public.users: ${roleErr.message} — app_metadata role still applies`);
  }

  console.log(`Admin account ready: ${email}`);
  console.log("(password not printed — it lives only in .env.local, which is gitignored)");
}

createAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Admin creation failed:", err.message);
    process.exit(1);
  });
