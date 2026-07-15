import { db } from "./index.js";
import { products, categories } from "./schema.js";
import { sql } from "drizzle-orm";
import { seedBiotechCatalog } from "./seed-biocatalog.js";

async function migrateImagePaths() {
  try {
    await db.execute(
      sql`UPDATE products SET image = '/images/' || replace(image, '/src/assets/images/', '') WHERE image LIKE '/src/assets/images/%'`
    );
  } catch (error) {
    console.error("Image path migration failed:", error.message);
  }
}

async function seedDatabase() {
  try {
    await migrateImagePaths();
    await seedBiotechCatalog();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error.message);
  }
}

export {
  seedDatabase
};
