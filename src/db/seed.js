import { db } from "./index.js";
import { products, categories } from "./schema.js";
import { sql } from "drizzle-orm";
import { seedBiotechCatalog } from "./seed-biocatalog.js";

async function seedDatabase() {
  try {
    await seedBiotechCatalog();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error.message);
  }
}

export {
  seedDatabase
};
