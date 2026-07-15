import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { BIO_PRODUCTS, BIO_CATEGORIES } from "../src/db/seed-biocatalog.js";

// Seed over HTTPS using the service-role key (server-side only). This avoids
// the direct Postgres TCP connection, which is refused from this environment,
// and bypasses RLS so the catalog can be written. Re-runnable via upsert.

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || p.name.toUpperCase(),
    category: p.category,
    description: p.description,
    details: Array.isArray(p.details) ? p.details : [],
    volume: p.volume ?? null,
    price: Number(p.price),
    price_original: p.priceOriginal ? Number(p.priceOriginal) : null,
    image: p.image,
    rating: Number(p.rating ?? 5),
    reviews_count: Number(p.reviewsCount ?? 0),
    stock: Number(p.stock ?? 25),
    texture: p.texture ?? null,
    fragrance_profile: p.fragranceProfile ?? null,
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
    care_goals: Array.isArray(p.careGoals) ? p.careGoals : [],
    label: p.label ?? null
  };
}

async function seed() {
  console.log(`Seeding ${BIO_PRODUCTS.length} products and ${BIO_CATEGORIES.length} categories over HTTPS...`);

  // Category counts derived from the product set (authoritative).
  const counts = {};
  for (const p of BIO_PRODUCTS) counts[p.category] = (counts[p.category] || 0) + 1;
  const categoryRows = BIO_CATEGORIES.map((c) => ({ name: c.name, count: counts[c.name] || 0 }));

  const { error: catErr } = await supabase.from("categories").upsert(categoryRows, { onConflict: "name" });
  if (catErr) throw new Error(`categories: ${catErr.message}`);

  const { error: prodErr } = await supabase
    .from("products")
    .upsert(BIO_PRODUCTS.map(normalizeProduct), { onConflict: "id" });
  if (prodErr) throw new Error(`products: ${prodErr.message}`);

  const { count: pCount, error: pErr } = await supabase.from("products").select("*", { count: "exact", head: true });
  const { count: cCount, error: cErr } = await supabase.from("categories").select("*", { count: "exact", head: true });
  if (pErr || cErr) throw new Error(`verify: ${pErr?.message || cErr?.message}`);

  console.log(`Done. Products: ${pCount}, Categories: ${cCount}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  });
