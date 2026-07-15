const PRODUCTS = [
  {
    id: "biotech-liposomal-anti-fungal-soap",
    name: "Liposomal Anti-Fungal Soap",
    subtitle: "LIPOSOMAL ANTI-FUNGAL SOAP",
    price: 14.99,
    image: "/src/assets/images/Anti-Fungal Soap.png",
    description: "Advanced, clinically inspired liposomal bar soap engineered to target fungal-prone skin with continuous, gentle active delivery.",
    details: [
      "Sulfur (10%)",
      "Salicylic Acid (3%)",
      "Liposomal actives for prolonged contact",
      "Dermatologically guided cleansing"
    ],
    volume: "75GM",
    category: "Soaps",
    rating: 4.8,
    reviewsCount: 520
  },
  {
    id: "biotech-liposomal-l-glutathione-soap",
    name: "Liposomal L-Glutathione Soap",
    subtitle: "LIPOSOMAL L-GLUTATHIONE SOAP",
    price: 14.99,
    image: "/src/assets/images/Glutathione Soap.png",
    description: "Scientific brightening bar soap formulated with liposomal glutathione and supportive antioxidants for visibly refined, even-toned skin.",
    details: [
      "Glutathione",
      "Vitamin C & E",
      "Kojic Acid",
      "Niacinamide"
    ],
    volume: "75GM",
    category: "Soaps",
    rating: 4.7,
    reviewsCount: 410
  },
  {
    id: "biotech-anti-hair-fall-shampoo",
    name: "Liposomal Anti-Hair Fall Hair Nourishment Medicated Shampoo",
    subtitle: "LIPOSOMAL ANTI-HAIR FALL SHAMPOO",
    price: 19.99,
    image: "/src/assets/images/Anti-Hair Fall Shampoo.png",
    description: "Medicated shampoo delivering supportive liposomal actives for hair strength—engineered to reduce the look of shedding and nourish the scalp.",
    details: [
      "Biotin",
      "Keratin",
      "Salicylic Acid",
      "Vitamin B6",
      "Vitamin E"
    ],
    volume: "200ml",
    category: "Hair Care",
    rating: 4.6,
    reviewsCount: 180
  },
  {
    id: "biotech-anti-acne-facewash",
    name: "Liposomal Anti-Acne Medicated Facewash",
    subtitle: "LIPOSOMAL ANTI-ACNE FACEWASH",
    price: 18.99,
    image: "/src/assets/images/Anti-Acne Facewash.png",
    description: "Clinical liposomal medicated facewash designed for clearer-looking skin—supports acne management with layered, continuous active release.",
    details: [
      "Salicylic Acid",
      "A.C Net Gel",
      "Sodium Hyaluronate",
      "Vitamin B3",
      "Collagen"
    ],
    volume: "150ml",
    category: "Facewash",
    rating: 4.7,
    reviewsCount: 260
  },
  {
    id: "biotech-brightening-facewash",
    name: "Liposomal Medicated Brightening Facewash",
    subtitle: "LIPOSOMAL MEDICATED BRIGHTENING FACEWASH",
    price: 18.99,
    image: "/src/assets/images/Medicated Brightening Facewash.png",
    description: "Brightening liposomal facewash formulated with multifunctional botanicals and antioxidants to support a more even, luminous complexion.",
    details: [
      "Alpha Arbutin",
      "Beta Arbutin",
      "Hyaluronic Acid",
      "Glutathione",
      "Vitamin C",
      "Aloe Vera",
      "L-Arginine"
    ],
    volume: "150ml",
    category: "Facewash",
    rating: 4.8,
    reviewsCount: 310
  },
  {
    id: "biotech-skinosome",
    name: "Skinosome",
    subtitle: "DARK SPOT TREATMENT SKINOSOME",
    price: 24.99,
    image: "/src/assets/images/Skinosome Cream Tube.png",
    description: "Dark spot treatment cream engineered to support targeted pigment reduction while improving comfort and visibly refined skin texture.",
    details: [
      "Vitamin E",
      "Vitamin C",
      "Alpha Arbutin",
      "Licorice Extract",
      "Allantoin"
    ],
    volume: "30gms",
    category: "Skincare (Creams & Serums)",
    rating: 4.6,
    reviewsCount: 210
  },
  {
    id: "biotech-liposomal-brightening-cream",
    name: "Liposomal Brightening Cream",
    subtitle: "LIPOSOMAL BRIGHTENING CREAM",
    price: 26.99,
    image: "/src/assets/images/Liposomal Brightening Cream.png",
    description: "Liposomal brightening cream designed for antioxidant support and hydration—helps deliver a visibly smoother, more luminous complexion.",
    details: [
      "Glutathione",
      "Arbutin",
      "Vit. C",
      "Hyaluronic Acid"
    ],
    volume: "50ml",
    category: "Skincare (Creams & Serums)",
    rating: 4.7,
    reviewsCount: 240
  },
  {
    id: "biotech-liposomal-acne-repair-complex",
    name: "Liposomal Acne Repair Complex",
    subtitle: "LIPOSOMAL ACNE REPAIR COMPLEX",
    price: 21.99,
    image: "/src/assets/images/Acne Repair Complex Serum (dropper).png",
    description: "Targeted acne repair serum powered by dermatology-forward actives—supports clearer appearance while calming the look of stressed skin.",
    details: [
      "Azelaic Acid Gel",
      "Salicylic Acid",
      "Madecassoside"
    ],
    volume: "30ml",
    category: "Skincare (Creams & Serums)",
    rating: 4.6,
    reviewsCount: 195
  },
  {
    id: "biotech-hyasomal-complete-repair-complex",
    name: "Hyasomal Complete Repair Complex",
    subtitle: "HYASOMAL COMPLETE REPAIR COMPLEX",
    price: 23.99,
    image: "/src/assets/images/Hyasomal Complete Repair Complex Serum.png",
    description: "Hyasomal repair complex engineered to support barrier recovery, wrinkle comfort, and hydrated plumpness for resilient-looking skin.",
    details: [
      "DMAE",
      "Matrixyl 3000",
      "MAP Vit C Derivative",
      "Hyaluronic Acid LMW",
      "Niacinamide"
    ],
    volume: "30ml",
    category: "Skincare (Creams & Serums)",
    rating: 4.8,
    reviewsCount: 230
  },
  {
    id: "biotech-liposomal-glutathione-500mg",
    name: "Liposomal L-Glutathione 500mg",
    subtitle: "LIPOSOMAL L-GLUTATHIONE 500MG",
    price: 29.99,
    image: "/src/assets/images/L-Glutathione 500mg Supplement.png",
    description: "Liposomal glutathione supplement engineered for higher bioavailability support alongside antioxidant co-actives.",
    details: [
      "+ Alpha Lipoic Acid",
      "Vitamin C & E",
      "Liposomal delivery system"
    ],
    volume: "30 Capsules",
    category: "Oral Supplements",
    rating: 4.7,
    reviewsCount: 120
  },
  {
    id: "biotech-hyasomal-sodium-hyaluronate-200mg",
    name: "Hyasomal — Sodium Hyaluronate 200mg",
    subtitle: "HYASOMAL SODIUM HYALURONATE 200MG",
    price: 27.99,
    image: "/src/assets/images/Hyasomal Boxes.png",
    description: "Hyasomal sodium hyaluronate supplement engineered for hydration support—designed for daily wellness routines.",
    details: [
      "Hyasomal delivery",
      "Daily hydration support",
      "Dermal-plump comfort focus"
    ],
    volume: "30 Capsules",
    category: "Oral Supplements",
    rating: 4.6,
    reviewsCount: 105
  }
];

const CATEGORIES = [
  {
    id: "soaps",
    name: "Soaps",
    slug: "soaps",
    shortDescription: "Liposomal cleansing bars engineered for targeted skin therapy with prolonged active ingredient contact.",
    categoryKey: "Soaps"
  },
  {
    id: "hair-care",
    name: "Hair Care",
    slug: "hair-care",
    shortDescription: "Scientifically formulated hair nourishment solutions with liposomal delivery for scalp health and strand strength.",
    categoryKey: "Hair Care"
  },
  {
    id: "facewash",
    name: "Facewash",
    slug: "facewash",
    shortDescription: "Advanced medicated facial cleansers utilizing liposomal technology for continuous, gentle active release.",
    categoryKey: "Facewash"
  },
  {
    id: "skincare-creams-serums",
    name: "Skincare (Creams & Serums)",
    slug: "skincare-creams-serums",
    shortDescription: "Targeted treatment creams and serums with biomimetic delivery systems for enhanced skin absorption and efficacy.",
    categoryKey: "Skincare (Creams & Serums)"
  },
  {
    id: "oral-supplements",
    name: "Oral Supplements",
    slug: "oral-supplements",
    shortDescription: "Clinically-dosed liposomal and hyaluronic supplements for systemic wellness and antioxidant support.",
    categoryKey: "Oral Supplements"
  }
];

export {
  PRODUCTS,
  CATEGORIES
};
