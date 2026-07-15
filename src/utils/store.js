import { getAuthHeaders } from "../lib/supabase.js";
import { getDisplayPrice } from "../lib/sale.js";

const DEFAULT_PRODUCTS = [
  {
    id: "biotech-liposomal-anti-fungal-soap",
    name: "Liposomal Anti-Fungal Soap",
    subtitle: "LIPOSOMAL ANTI-FUNGAL SOAP",
    description: "Advanced, clinically inspired liposomal bar soap engineered to target fungal-prone skin with continuous, gentle active delivery.",
    price: 14.99,
    priceOriginal: null,
    image: "/src/assets/images/Anti-Fungal Soap.png",
    details: ["Sulfur (10%)","Salicylic Acid (3%)","Liposomal actives for prolonged contact","Dermatologically guided cleansing"],
    volume: "75GM",
    category: "Soaps",
    rating: 4.8,
    reviewsCount: 520,
    stock: 25,
    texture: "Bar",
    fragranceProfile: "Medicinal",
    ingredients: ["Sulfur","Salicylic Acid"],
    careGoals: ["Anti-fungal","Acne-support"],
    label: "NEW"
  },
  {
    id: "biotech-liposomal-l-glutathione-soap",
    name: "Liposomal L-Glutathione Soap",
    subtitle: "LIPOSOMAL L-GLUTATHIONE SOAP",
    description: "Scientific brightening bar soap formulated with liposomal glutathione and supportive antioxidants for visibly refined, even-toned skin.",
    price: 14.99,
    priceOriginal: null,
    image: "/src/assets/images/Glutathione Soap.png",
    details: ["Glutathione","Vitamin C & E","Kojic Acid","Niacinamide"],
    volume: "75GM",
    category: "Soaps",
    rating: 4.7,
    reviewsCount: 410,
    stock: 22,
    texture: "Bar",
    fragranceProfile: "Fresh",
    ingredients: ["Glutathione","Vitamin C","Vitamin E","Kojic Acid","Niacinamide"],
    careGoals: ["Brightening","Exfoliation"],
    label: "NEW"
  },
  {
    id: "biotech-anti-hair-fall-shampoo",
    name: "Liposomal Anti-Hair Fall Hair Nourishment Medicated Shampoo",
    subtitle: "LIPOSOMAL ANTI-HAIR FALL SHAMPOO",
    description: "Medicated shampoo delivering supportive liposomal actives for hair strength—engineered to reduce the look of shedding and nourish the scalp.",
    price: 19.99,
    priceOriginal: null,
    image: "/src/assets/images/Anti-Hair Fall Shampoo.png",
    details: ["Biotin","Keratin","Salicylic Acid","Vitamin B6","Vitamin E"],
    volume: "200ml",
    category: "Hair Care",
    rating: 4.6,
    reviewsCount: 180,
    stock: 18,
    texture: "Shampoo",
    fragranceProfile: "Herbal",
    ingredients: ["Biotin","Keratin","Salicylic Acid","Vitamin B6","Vitamin E"],
    careGoals: ["Anti-hair fall","Nourishment"],
    label: "NEW"
  },
  {
    id: "biotech-anti-acne-facewash",
    name: "Liposomal Anti-Acne Medicated Facewash",
    subtitle: "LIPOSOMAL ANTI-ACNE FACEWASH",
    description: "Clinical liposomal medicated facewash designed for clearer-looking skin—supports acne management with layered, continuous active release.",
    price: 18.99,
    priceOriginal: null,
    image: "/src/assets/images/Anti-Acne Facewash.png",
    details: ["Salicylic Acid","A.C Net Gel","Sodium Hyaluronate","Vitamin B3","Collagen"],
    volume: "150ml",
    category: "Facewash",
    rating: 4.7,
    reviewsCount: 260,
    stock: 20,
    texture: "Gel",
    fragranceProfile: "Clean",
    ingredients: ["Salicylic Acid","A.C Net Gel","Sodium Hyaluronate","Vitamin B3","Collagen"],
    careGoals: ["Anti-acne","Hydration"],
    label: "NEW"
  },
  {
    id: "biotech-brightening-facewash",
    name: "Liposomal Medicated Brightening Facewash",
    subtitle: "LIPOSOMAL MEDICATED BRIGHTENING FACEWASH",
    description: "Brightening liposomal facewash formulated with multifunctional botanicals and antioxidants to support a more even, luminous complexion.",
    price: 18.99,
    priceOriginal: null,
    image: "/src/assets/images/Medicated Brightening Facewash.png",
    details: ["Alpha Arbutin","Beta Arbutin","Hyaluronic Acid","Glutathione","Vitamin C","Aloe Vera","L-Arginine"],
    volume: "150ml",
    category: "Facewash",
    rating: 4.8,
    reviewsCount: 310,
    stock: 24,
    texture: "Gel",
    fragranceProfile: "Fresh",
    ingredients: ["Alpha Arbutin","Beta Arbutin","Hyaluronic Acid","Glutathione","Vitamin C","Aloe Vera","L-Arginine"],
    careGoals: ["Brightening","Exfoliation"],
    label: "NEW"
  },
  {
    id: "biotech-skinosome",
    name: "Skinosome",
    subtitle: "DARK SPOT TREATMENT SKINOSOME",
    description: "Dark spot treatment cream engineered to support targeted pigment reduction while improving comfort and visibly refined skin texture.",
    price: 24.99,
    priceOriginal: null,
    image: "/src/assets/images/Skinosome Cream Tube.png",
    rating: 4.6,
    reviewsCount: 210,
    volume: "30gms",
    category: "Skincare (Creams & Serums)",
    stock: 16,
    texture: "Cream",
    fragranceProfile: "Soft",
    ingredients: ["Vitamin E","Vitamin C","Alpha Arbutin","Licorice Extract","Allantoin"],
    careGoals: ["Dark spots","Even tone"],
    label: "NEW",
    details: ["Vitamin E","Vitamin C","Alpha Arbutin","Licorice Extract","Allantoin"]
  },
  {
    id: "biotech-liposomal-brightening-cream",
    name: "Liposomal Brightening Cream",
    subtitle: "LIPOSOMAL BRIGHTENING CREAM",
    description: "Liposomal brightening cream designed for antioxidant support and hydration—helps deliver a visibly smoother, more luminous complexion.",
    price: 26.99,
    priceOriginal: null,
    image: "/src/assets/images/Liposomal Brightening Cream.png",
    rating: 4.7,
    reviewsCount: 240,
    category: "Skincare (Creams & Serums)",
    stock: 18,
    texture: "Cream",
    fragranceProfile: "Neutral",
    ingredients: ["Glutathione","Arbutin","Vitamin C","Hyaluronic Acid"],
    careGoals: ["Brightening","Hydration"],
    label: "NEW",
    details: ["Glutathione","Arbutin","Vit. C","Hyaluronic Acid"]
  },
  {
    id: "biotech-liposomal-acne-repair-complex",
    name: "Liposomal Acne Repair Complex",
    subtitle: "LIPOSOMAL ACNE REPAIR COMPLEX",
    description: "Targeted acne repair serum powered by dermatology-forward actives—supports clearer appearance while calming the look of stressed skin.",
    price: 21.99,
    priceOriginal: null,
    image: "/src/assets/images/Acne Repair Complex Serum (dropper).png",
    rating: 4.6,
    reviewsCount: 195,
    category: "Skincare (Creams & Serums)",
    stock: 19,
    texture: "Gel-Serum",
    fragranceProfile: "Clean",
    ingredients: ["Azelaic Acid","Salicylic Acid","Madecassoside"],
    careGoals: ["Acne repair","Soothing"],
    label: "NEW",
    details: ["Azelaic Acid Gel","Salicylic Acid","Madecassoside"]
  },
  {
    id: "biotech-hyasomal-complete-repair-complex",
    name: "Hyasomal Complete Repair Complex",
    subtitle: "HYASOMAL COMPLETE REPAIR COMPLEX",
    description: "Hyasomal repair complex engineered to support barrier recovery, wrinkle comfort, and hydrated plumpness for resilient-looking skin.",
    price: 23.99,
    priceOriginal: null,
    image: "/src/assets/images/Hyasomal Complete Repair Complex Serum.png",
    rating: 4.8,
    reviewsCount: 230,
    category: "Skincare (Creams & Serums)",
    stock: 17,
    texture: "Serum",
    fragranceProfile: "Fragrance-free",
    ingredients: ["DMAE","Matrixyl 3000","Vitamin C Derivative","Hyaluronic Acid","Niacinamide"],
    careGoals: ["Repair","Hydration"],
    label: "NEW",
    details: ["DMAE","Matrixyl 3000","MAP Vit C Derivative","Hyaluronic Acid LMW","Niacinamide"]
  },
  {
    id: "biotech-liposomal-glutathione-500mg",
    name: "Liposomal L-Glutathione 500mg",
    subtitle: "LIPOSOMAL L-GLUTATHIONE 500MG",
    description: "Liposomal glutathione supplement engineered for higher bioavailability support alongside antioxidant co-actives.",
    price: 29.99,
    priceOriginal: null,
    image: "/src/assets/images/L-Glutathione 500mg Supplement.png",
    rating: 4.7,
    reviewsCount: 120,
    category: "Oral Supplements",
    stock: 25,
    texture: "Capsules",
    fragranceProfile: "—",
    ingredients: ["Glutathione","Alpha Lipoic Acid","Vitamin C","Vitamin E"],
    careGoals: ["Antioxidant support"],
    label: "NEW",
    details: ["+ Alpha Lipoic Acid","Vitamin C & E","Liposomal delivery system"]
  },
  {
    id: "biotech-hyasomal-sodium-hyaluronate-200mg",
    name: "Hyasomal — Sodium Hyaluronate 200mg",
    subtitle: "HYASOMAL SODIUM HYALURONATE 200MG",
    description: "Hyasomal sodium hyaluronate supplement engineered for hydration support—designed for daily wellness routines.",
    price: 27.99,
    priceOriginal: null,
    image: "/src/assets/images/Hyasomal Boxes.png",
    rating: 4.6,
    reviewsCount: 105,
    category: "Oral Supplements",
    stock: 22,
    texture: "Capsules",
    fragranceProfile: "—",
    ingredients: ["Sodium Hyaluronate"],
    careGoals: ["Hydration support"],
    label: "NEW",
    details: ["Hyasomal delivery","Daily hydration support","Dermal-plump comfort focus"]
  }
];
const DEFAULT_CATEGORIES = [
  { name: "Soaps", count: 2 },
  { name: "Hair Care", count: 1 },
  { name: "Facewash", count: 2 },
  { name: "Skincare (Creams & Serums)", count: 4 },
  { name: "Oral Supplements", count: 2 }
];
const DEFAULT_ORDERS = [];
const STORAGE_KEY = "numa_store_v3";
function loadStore() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initial = {
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      orders: DEFAULT_ORDERS,
      currentUser: null,
      messages: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse store", e);
    return {
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      orders: DEFAULT_ORDERS,
      currentUser: null,
      messages: []
    };
  }
}
function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
const NumaStore = {
  async syncFromDatabase() {
    try {
      const prodRes = await fetch("/api/products");
      if (!prodRes.ok) throw new Error("Failed to fetch products");
      const products = await prodRes.json();
      const catRes = await fetch("/api/categories");
      if (!catRes.ok) throw new Error("Failed to fetch categories");
      const categories = await catRes.json();
      const headers = await getAuthHeaders();
      const orderRes = await fetch("/api/orders", { headers });
      if (!orderRes.ok) throw new Error("Failed to fetch orders");
      const orders = await orderRes.json();
      const store = loadStore();
      store.products = products;
      store.categories = categories;
      store.orders = orders;
      saveStore(store);
      return true;
    } catch (err) {
      console.error("Failed to sync from database:", err);
      return false;
    }
  },
  getProducts() {
    const store = loadStore();
    if (!store.products || store.products.length === 0) {
      return DEFAULT_PRODUCTS;
    }
    return store.products;
  },
  getCategories() {
    const store = loadStore();
    if (!store.categories || store.categories.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    return store.categories;
  },
  getOrders() {
    const store = loadStore();
    return [...store.orders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  getCurrentUser() {
    const store = loadStore();
    return store.currentUser;
  },
  getMessages() {
    const store = loadStore();
    return store.messages;
  },
  addProduct(product) {
    const store = loadStore();
    const newProduct = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || "Untitled Product",
      subtitle: (product.name || "Untitled Product").toUpperCase(),
      price: product.price || 20,
      priceOriginal: product.priceOriginal || null,
      onSale: product.onSale || false,
      salePrice: product.salePrice != null ? Number(product.salePrice) : null,
      saleStart: product.saleStart || null,
      saleEnd: product.saleEnd || null,
      image: product.image || "/src/assets/images/Anti-Fungal Soap.png",
      description: product.description || "A gorgeous botanical formulation designed for skin wellness and sensory relief.",
      details: product.details || ["Formulated with natural botanical active ingredients","Safe for daily use"],
      volume: product.volume || "150 ml",
      category: product.category || "Skincare",
      rating: product.rating || 5,
      reviewsCount: product.reviewsCount || 0,
      stock: product.stock !== void 0 ? product.stock : 25,
      texture: product.texture || "Cream",
      fragranceProfile: product.fragranceProfile || "Fresh",
      ingredients: product.ingredients || ["Vegan","Cruelty-Free"],
      careGoals: product.careGoals || ["Hydration"],
      label: product.label || null
    };
    store.products.push(newProduct);
    const cat = store.categories.find((c) => c.name.toLowerCase() === newProduct.category.toLowerCase());
    if (cat) {
      cat.count += 1;
    }
    saveStore(store);
    getAuthHeaders().then((headers) => {
      fetch("/api/products", {
        method: "POST",
        headers,
        body: JSON.stringify(newProduct)
      }).catch((err) => console.error("Database sync failed for addProduct:", err));
    });
    return newProduct;
  },
  addCategory(name) {
    const store = loadStore();
    const exists = store.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      store.categories.push({ name, count: 0 });
      saveStore(store);
      getAuthHeaders().then((headers) => {
        fetch("/api/categories", {
          method: "POST",
          headers,
          body: JSON.stringify({ name })
        }).catch((err) => console.error("Database sync failed for addCategory:", err));
      });
    }
  },
  login(email, displayName, provider, id, role = "user") {
    const store = loadStore();
    const user = {
      id: id || `usr-${Date.now()}`,
      email,
      displayName,
      provider,
      role,
      avatarUrl: provider === "google"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"
        : provider === "apple"
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100"
          : undefined
    };
    store.currentUser = user;
    saveStore(store);
    return user;
  },
  logout() {
    const store = loadStore();
    store.currentUser = null;
    saveStore(store);
  },
  createOrder(cartItems) {
    const store = loadStore();
    const user = store.currentUser || {
      id: "usr-guest",
      email: "guest@biotechsciences.com",
      displayName: "Guest Buyer",
      provider: "email"
    };
    const subtotal = cartItems.reduce((sum, item) => sum + getDisplayPrice(item.product).price * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + shipping;
    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: getDisplayPrice(item.product).price,
      quantity: item.quantity,
      image: item.product.image
    }));
    const order = {
      id: `ORD-${Math.floor(1e3 + Math.random() * 9e3)}`,
      userId: user.id,
      userEmail: user.email,
      displayName: user.displayName,
      items: orderItems,
      subtotal,
      shipping,
      total,
      timestamp: new Date().toISOString(),
      status: "Pending"
    };
    store.products = store.products.map((p) => {
      const purchased = cartItems.find((item) => item.product.id === p.id);
      if (purchased) {
        const currentStock = p.stock !== void 0 ? p.stock : 20;
        return {
          ...p,
          stock: Math.max(0, currentStock - purchased.quantity)
        };
      }
      return p;
    });
    store.orders.push(order);
    saveStore(store);
    const performOrderSync = async () => {
      try {
        const headers = await getAuthHeaders();
        await fetch("/api/orders", {
          method: "POST",
          headers,
          body: JSON.stringify({ cartItems })
        });
      } catch (err) {
        console.error("Database sync failed for createOrder:", err);
      }
    };
    performOrderSync();
    return order;
  },
  submitContactMessage(name, email, subject, message) {
    const store = loadStore();
    const newMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    };
    store.messages.push(newMessage);
    saveStore(store);
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage)
    }).catch((err) => console.error("Database sync failed for submitContactMessage:", err));
    return newMessage;
  }
};
export {
  NumaStore,
  loadStore,
  saveStore
};
