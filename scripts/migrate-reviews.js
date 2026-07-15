import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); dotenv.config();

import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SQL = `
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  display_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_timestamp ON reviews(timestamp DESC);
`;

async function migrate() {
  console.log("Connecting to database...");
  await client.connect();
  console.log("Creating reviews table...");
  await client.query(SQL);
  console.log("Done! Reviews table created.");
  await client.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
