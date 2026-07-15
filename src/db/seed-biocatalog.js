import { db } from "./index.js";
import { products, categories } from "./schema.js";
import { sql } from "drizzle-orm";

const BIO_CATEGORIES = [
  { name: "Soaps", count: 0 },
  { name: "Hair Care", count: 0 },
  { name: "Facewash", count: 0 },
  { name: "Skincare (Creams & Serums)", count: 0 },
  { name: "Oral Supplements", count: 0 }
];

const BIO_PRODUCTS = [
  {
    id: "biotech-liposomal-anti-fungal-soap",
    name: "Liposomal Anti-Fungal Soap",
    subtitle: "LIPOSOMAL ANTI-FUNGAL SOAP",
    category: "Soaps",
    description: "Advanced, clinically inspired liposomal bar soap engineered to target fungal-prone skin with continuous, gentle active delivery.",
    details: ["Sulfur (10%)", "Salicylic Acid (3%)", "Liposomal actives for prolonged contact", "Dermatologically guided cleansing"],
    volume: "75GM",
    price: 375,
    image: "/src/assets/images/Anti-Fungal Soap.png",
    rating: 4.8,
    reviewsCount: 520,
    stock: 25,
    texture: "Bar",
    fragranceProfile: "Medicinal",
    ingredients: ["Sulfur", "Salicylic Acid"],
    careGoals: ["Anti-fungal", "Acne-support"],
    label: "NEW"
  },
  {
    id: "biotech-liposomal-l-glutathione-soap",
    name: "Liposomal L-Glutathione Soap",
    subtitle: "LIPOSOMAL L-GLUTATHIONE SOAP",
    category: "Soaps",
    description: "Scientific brightening bar soap formulated with liposomal glutathione and supportive antioxidants for visibly refined, even-toned skin.",
    details: ["Glutathione", "Vitamin C & E", "Kojic Acid", "Niacinamide"],
    volume: "75GM",
    price: 490,
    image: "/src/assets/images/Glutathione Soap.png",
    rating: 4.7,
    reviewsCount: 410,
    stock: 22,
    texture: "Bar",
    fragranceProfile: "Fresh",
    ingredients: ["Glutathione", "Vitamin C", "Vitamin E", "Kojic Acid", "Niacinamide"],
    careGoals: ["Brightening", "Exfoliation"],
    label: "NEW"
  },
  {
    id: "biotech-anti-hair-fall-shampoo",
    name: "Liposomal Anti-Hair Fall Hair Nourishment Medicated Shampoo",
    subtitle: "LIPOSOMAL ANTI-HAIR FALL SHAMPOO",
    category: "Hair Care",
    description: "Medicated shampoo delivering supportive liposomal actives for hair strength—engineered to reduce the look of shedding and nourish the scalp.",
    details: ["Biotin", "Keratin", "Salicylic Acid", "Vitamin B6", "Vitamin E"],
    price: 1350,
    image: "/src/assets/images/Anti-Hair Fall Shampoo.png",
    rating: 4.6,
    reviewsCount: 180,
    stock: 18,
    texture: "Shampoo",
    fragranceProfile: "Herbal",
    ingredients: ["Biotin", "Keratin", "Salicylic Acid", "Vitamin B6", "Vitamin E"],
    careGoals: ["Anti-hair fall", "Nourishment"],
    label: "NEW"
  },
  {
    id: "biotech-anti-acne-facewash",
    name: "Liposomal Anti-Acne Medicated Facewash",
    subtitle: "LIPOSOMAL ANTI-ACNE FACEWASH",
    category: "Facewash",
    description: "Clinical liposomal medicated facewash designed for clearer-looking skin—supports acne management with layered, continuous active release.",
    details: ["Salicylic Acid", "A.C Net Gel", "Sodium Hyaluronate", "Vitamin B3", "Collagen"],
    price: 1290,
    image: "/src/assets/images/Anti-Acne Facewash.png",
    rating: 4.7,
    reviewsCount: 260,
    stock: 20,
    texture: "Gel",
    fragranceProfile: "Clean",
    ingredients: ["Salicylic Acid", "A.C Net Gel", "Sodium Hyaluronate", "Vitamin B3", "Collagen"],
    careGoals: ["Anti-acne", "Hydration"],
    label: "NEW"
  },
  {
    id: "biotech-brightening-facewash",
    name: "Liposomal Medicated Brightening Facewash",
    subtitle: "LIPOSOMAL MEDICATED BRIGHTENING FACEWASH",
    category: "Facewash",
    description: "Brightening liposomal facewash formulated with multifunctional botanicals and antioxidants to support a more even, luminous complexion.",
    details: ["Alpha Arbutin", "Beta Arbutin", "Hyaluronic Acid", "Glutathione", "Vitamin C", "Aloe Vera", "L-Arginine"],
    price: 1250,
    image: "/src/assets/images/Medicated Brightening Facewash.png",
    rating: 4.8,
    reviewsCount: 310,
    stock: 24,
    texture: "Gel",
    fragranceProfile: "Fresh",
    ingredients: ["Alpha Arbutin", "Beta Arbutin", "Hyaluronic Acid", "Glutathione", "Vitamin C", "Aloe Vera", "L-Arginine"],
    careGoals: ["Brightening", "Exfoliation"],
    label: "NEW"
  },
  {
    id: "biotech-skinosome",
    name: "Skinosome",
    subtitle: "DARK SPOT TREATMENT SKINOSOME",
    category: "Skincare (Creams & Serums)",
    description: "Dark spot treatment cream engineered to support targeted pigment reduction while improving comfort and visibly refined skin texture.",
    details: ["Vitamin E", "Vitamin C", "Alpha Arbutin", "Licorice Extract", "Allantoin"],
    volume: "30gms",
    price: 1490,
    image: "/src/assets/images/Skinosome Cream Tube.png",
    rating: 4.6,
    reviewsCount: 210,
    stock: 16,
    texture: "Cream",
    fragranceProfile: "Soft",
    ingredients: ["Vitamin E", "Vitamin C", "Alpha Arbutin", "Licorice Extract", "Allantoin"],
    careGoals: ["Dark spots", "Even tone"],
    label: "NEW"
  },
  {
    id: "biotech-liposomal-brightening-cream",
    name: "Liposomal Brightening Cream",
    subtitle: "LIPOSOMAL BRIGHTENING CREAM",
    category: "Skincare (Creams & Serums)",
    description: "Liposomal brightening cream designed for antioxidant support and hydration—helps deliver a visibly smoother, more luminous complexion.",
    details: ["Glutathione", "Arbutin", "Vit. C", "Hyaluronic Acid"],
    price: 1850,
    image: "/src/assets/images/Liposomal Brightening Cream.png",
    rating: 4.7,
    reviewsCount: 240,
    stock: 18,
    texture: "Cream",
    fragranceProfile: "Neutral",
    ingredients: ["Glutathione", "Arbutin", "Vitamin C", "Hyaluronic Acid"],
    careGoals: ["Brightening", "Hydration"],
    label: "NEW"
  },
  {
    id: "biotech-liposomal-acne-repair-complex",
    name: "Liposomal Acne Repair Complex",
    subtitle: "LIPOSOMAL ACNE REPAIR COMPLEX",
    category: "Skincare (Creams & Serums)",
    description: "Targeted acne repair serum powered by dermatology-forward actives—supports clearer appearance while calming the look of stressed skin.",
    details: ["Azelaic Acid Gel", "Salicylic Acid", "Madecassoside"],
    price: 2400,
    image: "/src/assets/images/Acne Repair Complex Serum (dropper).png",
    rating: 4.6,
    reviewsCount: 195,
    stock: 19,
    texture: "Gel-Serum",
    fragranceProfile: "Clean",
    ingredients: ["Azelaic Acid", "Salicylic Acid", "Madecassoside"],
    careGoals: ["Acne repair", "Soothing"],
    label: "NEW"
  },
  {
    id: "biotech-hyasomal-complete-repair-complex",
    name: "Hyasomal Complete Repair Complex",
    subtitle: "HYASOMAL COMPLETE REPAIR COMPLEX",
    category: "Skincare (Creams & Serums)",
    description: "Hyasomal repair complex engineered to support barrier recovery, wrinkle comfort, and hydrated plumpness for resilient-looking skin.",
    details: ["DMAE", "Matrixyl 3000", "MAP Vit C Derivative", "Hyaluronic Acid LMW", "Niacinamide"],
    price: 2800,
    image: "/src/assets/images/Hyasomal Complete Repair Complex Serum.png",
    rating: 4.8,
    reviewsCount: 230,
    stock: 17,
    texture: "Serum",
    fragranceProfile: "Fragrance-free",
    ingredients: ["DMAE", "Matrixyl 3000", "Vitamin C Derivative", "Hyaluronic Acid", "Niacinamide"],
    careGoals: ["Repair", "Hydration"],
    label: "NEW"
  },
  {
    id: "biotech-liposomal-glutathione-500mg",
    name: "Liposomal L-Glutathione 500mg",
    subtitle: "LIPOSOMAL L-GLUTATHIONE 500MG",
    category: "Oral Supplements",
    description: "Liposomal glutathione supplement engineered for higher bioavailability support alongside antioxidant co-actives.",
    details: ["+ Alpha Lipoic Acid", "Vitamin C & E", "Liposomal delivery system"],
    price: 5500,
    image: "/src/assets/images/L-Glutathione 500mg Supplement.png",
    rating: 4.7,
    reviewsCount: 120,
    stock: 25,
    texture: "Capsules",
    fragranceProfile: "—",
    ingredients: ["Glutathione", "Alpha Lipoic Acid", "Vitamin C", "Vitamin E"],
    careGoals: ["Antioxidant support"],
    label: "NEW"
  },
  {
    id: "biotech-hyasomal-sodium-hyaluronate-200mg",
    name: "Hyasomal — Sodium Hyaluronate 200mg",
    subtitle: "HYASOMAL SODIUM HYALURONATE 200MG",
    category: "Oral Supplements",
    description: "Hyasomal sodium hyaluronate supplement engineered for hydration support—designed for daily wellness routines.",
    details: ["Hyasomal delivery", "Daily hydration support", "Dermal-plump comfort focus"],
    price: 1050,
    image: "/src/assets/images/Hyasomal Boxes.png",
    rating: 4.6,
    reviewsCount: 105,
    stock: 22,
    texture: "Capsules",
    fragranceProfile: "—",
    ingredients: ["Sodium Hyaluronate"],
    careGoals: ["Hydration support"],
    label: "NEW"
  }
];

async function seedBiotechCatalog() {
  const existingCats = await db.select({ name: categories.name }).from(categories);
  const existingSet = new Set(existingCats.map((c) => c.name));
  const catsToInsert = BIO_CATEGORIES.filter((c) => !existingSet.has(c.name));
  if (catsToInsert.length) {
    await db.insert(categories).values(catsToInsert);
  }

  const existingProds = await db.select({ id: products.id }).from(products);
  const existingProdSet = new Set(existingProds.map((p) => p.id));
  const prodsToInsert = BIO_PRODUCTS.filter((p) => !existingProdSet.has(p.id));

  if (prodsToInsert.length) {
    await db.insert(products).values(
      prodsToInsert.map((prod) => ({
        ...prod,
        priceOriginal: prod.priceOriginal ?? null,
        subtitle: prod.subtitle || prod.name.toUpperCase(),
        volume: prod.volume ?? null,
        details: Array.isArray(prod.details) ? prod.details : [],
        ingredients: Array.isArray(prod.ingredients) ? prod.ingredients : [],
        careGoals: Array.isArray(prod.careGoals) ? prod.careGoals : [],
        label: prod.label ?? null,
        texture: prod.texture ?? null,
        fragranceProfile: prod.fragranceProfile ?? null,
        rating: prod.rating ?? 5,
        reviewsCount: prod.reviewsCount ?? 0,
        stock: prod.stock ?? 25,
      }))
    );

    for (const prod of prodsToInsert) {
      await db.execute(
        sql`INSERT INTO categories (name, count) VALUES (${prod.category}, 1)
            ON CONFLICT (name) DO UPDATE SET count = categories.count + 1`
      );
    }
  }
}

export { seedBiotechCatalog, BIO_CATEGORIES, BIO_PRODUCTS };
