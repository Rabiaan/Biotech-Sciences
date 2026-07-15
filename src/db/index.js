import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
const { Pool } = pg;
const createPool = () => {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 15_000,
      max: 10,
      ssl: process.env.DATABASE_URL.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined
    });
  }
  const isSupabase = process.env.SQL_HOST?.includes("supabase.co");
  return new Pool({
    host: process.env.SQL_HOST,
    port: Number(process.env.SQL_PORT) || 5432,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15_000,
    max: 10,
    ssl: isSupabase ? { rejectUnauthorized: false } : false
  });
};
const pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
const db = drizzle(pool, { schema });
import * as schema2 from "./schema.js";
export {
  createPool,
  db,
  schema2 as schema
};
