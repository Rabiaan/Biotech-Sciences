import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { products, categories, orders, contactMessages, users, reviews } from "./src/db/schema.js";
import { seedDatabase } from "./src/db/seed.js";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { createFallbackStore, buildFallbackCategories } from "./src/lib/fallbackData.js";
import { isAdminEmail } from "./src/lib/config.server.js";
import {
  authenticateToken,
  requireAuth,
  requireAdmin,
  requireJsonContent,
  securityHeaders
} from "./src/server/middleware.js";
import { apiRateLimit, authRateLimit, writeRateLimit } from "./src/server/rateLimit.js";
import {
  sanitizeString,
  validateContactInput,
  validateProductInput,
  validateOrderStatus,
  safeErrorMessage
} from "./src/server/security.js";

const fallbackStore = createFallbackStore();
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 15;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(express.json({ limit: "256kb" }));
  app.use(requireJsonContent);
  app.use(apiRateLimit);
  app.use(authenticateToken);

  try {
    await seedDatabase();
  } catch (err) {
    console.error("Database seeding failed:", err.message);
  }

  // ── User sync (Supabase Auth) ──────────────────────────────────────────────
  app.post("/api/users/sync", authRateLimit, requireAuth, async (req, res) => {
    try {
      const { uid, email, displayName } = req.body;
      if (!uid || !email || uid !== req.user.uid) {
        return res.status(400).json({ error: "Invalid user data" });
      }
      const role = isAdminEmail(email) ? "admin" : "user";
      const cleanName = sanitizeString(displayName, 200);
      const cleanEmail = sanitizeString(email, 254).toLowerCase();

      await db
        .insert(users)
        .values({ id: uid, email: cleanEmail, displayName: cleanName, role })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: cleanEmail,
            displayName: cleanName,
            role: isAdminEmail(cleanEmail) ? "admin" : sql`COALESCE(${users.role}, 'user')`,
            updatedAt: new Date()
          }
        });

      const row = await db.select().from(users).where(eq(users.id, uid)).limit(1);
      const userRole = row[0]?.role || role;
      res.json({ success: true, role: userRole, displayName: cleanName });
    } catch (error) {
      console.error("Error syncing user:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to sync user") });
    }
  });

  // ── Products ───────────────────────────────────────────────────────────────
  app.get("/api/products", async (_req, res) => {
    try {
      const prods = await db.select().from(products).orderBy(desc(products.createdAt));
      res.json(prods);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      res.json(fallbackStore.products);
    }
  });

  app.post("/api/products", writeRateLimit, requireAdmin, async (req, res) => {
    let newProduct;
    try {
      const validation = validateProductInput(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(", ") });
      }
      const prodData = req.body;
      const id = prodData.id || `prod-${Date.now()}`;
      newProduct = {
        id,
        name: sanitizeString(prodData.name, 200),
        subtitle: sanitizeString(prodData.subtitle || prodData.name.toUpperCase(), 200),
        price: Number(prodData.price),
        priceOriginal: prodData.priceOriginal ? Number(prodData.priceOriginal) : null,
        onSale: Boolean(prodData.onSale),
        salePrice: prodData.salePrice != null && prodData.salePrice !== "" ? Number(prodData.salePrice) : null,
        saleStart: prodData.saleStart ? new Date(prodData.saleStart) : null,
        saleEnd: prodData.saleEnd ? new Date(prodData.saleEnd) : null,
        image: sanitizeString(prodData.image || "/images/Anti-Fungal Soap.png", 500),
        description: sanitizeString(prodData.description || "A gorgeous formulation designed for beauty and skin-wellness.", 5000),
        details: Array.isArray(prodData.details) ? prodData.details.map((d) => sanitizeString(d, 500)) : [],
        volume: sanitizeString(prodData.volume || "150 ml", 50),
        category: sanitizeString(prodData.category, 100),
        rating: Number(prodData.rating || 5),
        reviewsCount: Number(prodData.reviewsCount || 0),
        stock: Number(prodData.stock !== undefined ? prodData.stock : 25),
        texture: sanitizeString(prodData.texture || "Cream", 50),
        fragranceProfile: sanitizeString(prodData.fragranceProfile || "Fresh", 50),
        ingredients: Array.isArray(prodData.ingredients) ? prodData.ingredients.map((i) => sanitizeString(i, 100)) : [],
        careGoals: Array.isArray(prodData.careGoals) ? prodData.careGoals.map((g) => sanitizeString(g, 100)) : [],
        label: prodData.label ? sanitizeString(prodData.label, 50) : null
      };
      await db.insert(products).values(newProduct);
      await db.execute(
        sql`INSERT INTO categories (name, count) VALUES (${newProduct.category}, 1)
            ON CONFLICT (name) DO UPDATE SET count = categories.count + 1`
      );
      fallbackStore.products.push(newProduct);
      fallbackStore.categories = buildFallbackCategories(fallbackStore.products);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error adding product:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to add product") });
    }
  });

  app.put("/api/products/:id", writeRateLimit, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id;
      if (updates.name) updates.name = sanitizeString(updates.name, 200);
      if (updates.image) updates.image = sanitizeString(updates.image, 500);
      if (updates.onSale !== undefined) updates.onSale = Boolean(updates.onSale);
      if (updates.salePrice !== undefined) {
        updates.salePrice = updates.salePrice != null && updates.salePrice !== "" ? Number(updates.salePrice) : null;
      }
      if (updates.saleStart !== undefined) {
        updates.saleStart = updates.saleStart ? new Date(updates.saleStart) : null;
      }
      if (updates.saleEnd !== undefined) {
        updates.saleEnd = updates.saleEnd ? new Date(updates.saleEnd) : null;
      }
      await db.update(products).set(updates).where(eq(products.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating product:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to update product") });
    }
  });

  app.delete("/api/products/:id", writeRateLimit, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const prod = await db.select().from(products).where(eq(products.id, id)).limit(1);
      if (prod.length > 0) {
        const categoryName = prod[0].category;
        await db.delete(products).where(eq(products.id, id));
        await db.execute(
          sql`UPDATE categories SET count = GREATEST(0, count - 1) WHERE name = ${categoryName}`
        );
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to delete product") });
    }
  });

  // ── Reviews ──────────────────────────────────────────────────────────────
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, id))
        .orderBy(desc(reviews.timestamp));
      res.json(productReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load reviews") });
    }
  });

  app.post("/api/products/:id/reviews", writeRateLimit, async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment, displayName } = req.body;
      const numRating = Number(rating);
      if (!numRating || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      const cleanComment = sanitizeString(comment, 1000);
      if (!cleanComment) {
        return res.status(400).json({ error: "Comment is required" });
      }
      const user = req.user || {};
      const cleanName = sanitizeString(displayName, 200) || "Anonymous";
      const newReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: id,
        userId: user.uid || "anonymous",
        userEmail: user.email || "",
        displayName: cleanName,
        rating: numRating,
        comment: cleanComment,
        timestamp: new Date()
      };
      await db.insert(reviews).values(newReview);
      res.status(201).json(newReview);
    } catch (error) {
      console.error("Error submitting review:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to submit review") });
    }
  });

  app.delete("/api/reviews/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
      if (!existing.length) {
        return res.status(404).json({ error: "Review not found" });
      }
      await db.delete(reviews).where(eq(reviews.id, id));
      res.json({ message: "Review deleted" });
    } catch (error) {
      console.error("Error deleting review:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to delete review") });
    }
  });

  // ── Media library (product images uploaded to /media) ───────────────────────
  app.get("/api/media/images", requireAdmin, async (_req, res) => {
    try {
      const mediaDir = path.join(process.cwd(), "media");
      const assetsImagesDir = path.join(process.cwd(), "public", "images");
      const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;
      const collect = (dir, urlPrefix) => {
        try {
          return fs
            .readdirSync(dir)
            .filter((f) => IMAGE_EXT.test(f))
            .map((f) => ({ name: f, url: `${urlPrefix}/${encodeURIComponent(f)}` }));
        } catch {
          return [];
        }
      };
      const fromAssets = collect(assetsImagesDir, "/images");
      const fromMedia = collect(mediaDir, "/media");
      const byName = new Map();
      for (const img of fromMedia) byName.set(img.name, img);
      for (const img of fromAssets) byName.set(img.name, img);
      const images = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
      res.json({ images });
    } catch (error) {
      console.error("Error listing media images:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to list media images") });
    }
  });

  // ── Categories ─────────────────────────────────────────────────────────────
  app.get("/api/categories", async (_req, res) => {
    try {
      const cats = await db.select().from(categories);
      res.json(cats);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      res.json(fallbackStore.categories);
    }
  });

  app.post("/api/categories", writeRateLimit, requireAdmin, async (req, res) => {
    try {
      const name = sanitizeString(req.body?.name, 100);
      if (!name) return res.status(400).json({ error: "Missing name" });
      await db.insert(categories).values({ name, count: 0 }).onConflictDoNothing();
      res.status(201).json({ name, count: 0 });
    } catch (error) {
      console.error("Error adding category:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to add category") });
    }
  });

  app.put("/api/categories/:name", writeRateLimit, requireAdmin, async (req, res) => {
    try {
      const oldName = decodeURIComponent(req.params.name);
      const newName = sanitizeString(req.body?.name, 100);
      if (!newName) return res.status(400).json({ error: "Missing name" });
      const [existing] = await db.select().from(categories).where(eq(categories.name, oldName)).limit(1);
      if (!existing) return res.status(404).json({ error: "Category not found" });
      await db.update(categories).set({ name: newName }).where(eq(categories.name, oldName));
      res.json({ name: newName, count: existing.count });
    } catch (error) {
      console.error("Error updating category:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to update category") });
    }
  });

  app.delete("/api/categories/:name", writeRateLimit, requireAdmin, async (req, res) => {
    try {
      const name = decodeURIComponent(req.params.name);
      await db.delete(categories).where(eq(categories.name, name));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to delete category") });
    }
  });

  // ── Orders ─────────────────────────────────────────────────────────────────
  app.get("/api/orders", async (req, res) => {
    try {
      let list;
      if (req.userRole === "admin") {
        list = await db.select().from(orders).orderBy(desc(orders.timestamp));
      } else if (req.user) {
        list = await db
          .select()
          .from(orders)
          .where(eq(orders.userId, req.user.uid))
          .orderBy(desc(orders.timestamp));
      } else {
        return res.json([]);
      }
      res.json(list);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      if (req.user) {
        const filtered = fallbackStore.orders.filter(
          (o) => o.userId === req.user.uid || o.userEmail === req.user.email
        );
        return res.json(filtered);
      }
      res.json([]);
    }
  });

  app.post("/api/orders", writeRateLimit, requireAuth, async (req, res) => {
    try {
      const { cartItems } = req.body;
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      const user = req.user;
      const effectivePrice = (prod) => {
        if (prod && prod.onSale && prod.salePrice != null) {
          const now = Date.now();
          if (prod.saleStart) {
            const s = new Date(prod.saleStart).getTime();
            if (!Number.isNaN(s) && now < s) return Number(prod.price);
          }
          if (prod.saleEnd) {
            const e = new Date(prod.saleEnd).getTime();
            if (!Number.isNaN(e) && now > e) return Number(prod.price);
          }
          return Number(prod.salePrice);
        }
        return Number(prod.price);
      };
      const subtotal = cartItems.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);
      const shipping = subtotal > 50 ? 0 : 5.99;
      const total = subtotal + shipping;
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        name: sanitizeString(item.product.name, 200),
        price: effectivePrice(item.product),
        quantity: Number(item.quantity),
        image: sanitizeString(item.product.image, 500)
      }));
      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: user.uid,
        userEmail: user.email,
        displayName: sanitizeString(user.displayName || "Customer", 200),
        items: orderItems,
        subtotal,
        shipping,
        total,
        timestamp: new Date(),
        status: "Pending"
      };
      await db.insert(orders).values(newOrder);
      for (const item of cartItems) {
        await db.execute(
          sql`UPDATE products SET stock = GREATEST(0, stock - ${item.quantity}) WHERE id = ${item.product.id}`
        );
      }
      fallbackStore.orders.push(newOrder);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to create order") });
    }
  });

  app.patch("/api/orders/:id/status", writeRateLimit, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!validateOrderStatus(status)) {
        return res.status(400).json({ error: "Invalid order status" });
      }
      await db.update(orders).set({ status }).where(eq(orders.id, id));
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating order status:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to update order") });
    }
  });

  // ── Admin APIs ─────────────────────────────────────────────────────────────
  app.get("/api/admin/reports", requireAdmin, async (_req, res) => {
    try {
      const allOrders = await db.select().from(orders);
      const allProducts = await db.select().from(products);
      const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
      const lowStock = allProducts.filter((p) => p.stock < LOW_STOCK_THRESHOLD);
      const statusBreakdown = allOrders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});
      const totalStock = allProducts.reduce((s, p) => s + p.stock, 0);
      res.json({
        totalRevenue,
        ordersCount: allOrders.length,
        productsCount: allProducts.length,
        totalStockUnits: totalStock,
        lowStockCount: lowStock.length,
        lowStockItems: lowStock.map((p) => ({ id: p.id, name: p.name, stock: p.stock, category: p.category })),
        statusBreakdown,
        averageOrderValue: allOrders.length ? totalRevenue / allOrders.length : 0
      });
    } catch (error) {
      console.error("Error fetching reports:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load reports") });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const email = sanitizeString(req.query.email || "", 254).toLowerCase();
      const date = sanitizeString(req.query.date || "", 20);
      const month = sanitizeString(req.query.month || "", 20);
      const from = sanitizeString(req.query.from || "", 30);
      const to = sanitizeString(req.query.to || "", 30);
      const conditions = [];
      if (email) conditions.push(eq(orders.userEmail, email));
      if (date) conditions.push(sql`DATE(${orders.timestamp}) = ${date}`);
      if (month) conditions.push(sql`TO_CHAR(${orders.timestamp}, 'YYYY-MM') = ${month}`);
      if (from) conditions.push(gte(orders.timestamp, new Date(from)));
      if (to) conditions.push(lte(orders.timestamp, new Date(to + "T23:59:59.999Z")));
      let query = db.select().from(orders);
      if (conditions.length) {
        query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
      }
      query = query.orderBy(desc(orders.timestamp));
      const list = await query;
      res.json(list);
    } catch (error) {
      console.error("Error fetching admin orders:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load orders") });
    }
  });

  app.get("/api/admin/inventory", requireAdmin, async (_req, res) => {
    try {
      const allProducts = await db.select().from(products).orderBy(products.stock);
      const lowStock = allProducts.filter((p) => p.stock < LOW_STOCK_THRESHOLD);
      res.json({ products: allProducts, lowStock, threshold: LOW_STOCK_THRESHOLD });
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load inventory") });
    }
  });

  app.get("/api/admin/messages", requireAdmin, async (_req, res) => {
    try {
      const msgs = await db.select().from(contactMessages).orderBy(desc(contactMessages.timestamp));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load messages") });
    }
  });

  app.patch("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { answered } = req.body;
      const value = typeof answered === "boolean" ? answered : true;
      const [updated] = await db
        .update(contactMessages)
        .set({
          answered: value,
          answeredAt: value ? new Date() : null
        })
        .where(eq(contactMessages.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating message:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to update message") });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load users") });
    }
  });

  app.get("/api/admin/users/:id/orders", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userOrders = await db.select().from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.timestamp));
      res.json(userOrders);
    } catch (error) {
      console.error("Error fetching user orders:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load user orders") });
    }
  });

  app.delete("/api/admin/users/:id", writeRateLimit, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userRows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      if (userRows[0].role === "admin") {
        return res.status(403).json({ error: "Cannot delete admin users" });
      }
      await db.delete(users).where(eq(users.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to delete user") });
    }
  });

  app.get("/api/admin/orders/today", requireAdmin, async (_req, res) => {
    try {
      const todayOrders = await db
        .select()
        .from(orders)
        .where(sql`DATE(${orders.timestamp}) = CURRENT_DATE`)
        .orderBy(desc(orders.timestamp));
      res.json(todayOrders);
    } catch (error) {
      console.error("Error fetching today's orders:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to load today's orders") });
    }
  });

  // ── Contact messages ───────────────────────────────────────────────────────
  app.post("/api/messages", writeRateLimit, async (req, res) => {
    try {
      const validation = validateContactInput(req.body);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(", ") });
      }
      const { name, email, subject, message } = validation.data;
      const newMessage = {
        id: `msg-${Date.now()}`,
        name,
        email,
        subject,
        message,
        timestamp: new Date()
      };
      await db.insert(contactMessages).values(newMessage);
      fallbackStore.messages.push(newMessage);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error saving message:", error.message);
      res.status(500).json({ error: safeErrorMessage(error, "Failed to send message") });
    }
  });

  // ── Health check ───────────────────────────────────────────────────────────
  app.get("/api/health", async (_req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: "ok", database: "connected" });
    } catch {
      res.status(503).json({ status: "degraded", database: "unavailable" });
    }
  });

  // ── Frontend ─────────────────────────────────────────────────────────────
  // Serve the media library (admin-uploaded product images) at /media in both
  // dev and production. Files placed in the project's `media/` folder are served here.
  app.use("/media", express.static(path.join(process.cwd(), "media")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const publicPath = path.join(process.cwd(), "public");
    app.use(express.static(distPath));
    app.use(express.static(publicPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
