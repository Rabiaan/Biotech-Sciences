import { pgTable, text, timestamp, integer, doublePrecision, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
const categories = pgTable("categories", {
  name: text("name").primaryKey(),
  count: integer("count").default(0).notNull()
});
const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subtitle: text("subtitle"),
  price: doublePrecision("price").notNull(),
  priceOriginal: doublePrecision("price_original"),
  onSale: boolean("on_sale").default(false).notNull(),
  salePrice: doublePrecision("sale_price"),
  saleStart: timestamp("sale_start"),
  saleEnd: timestamp("sale_end"),
  image: text("image").notNull(),
  description: text("description").notNull(),
  details: jsonb("details").notNull(),
  // string[]
  volume: text("volume"),
  category: text("category").notNull(),
  rating: doublePrecision("rating").notNull(),
  reviewsCount: integer("reviews_count").notNull(),
  stock: integer("stock").notNull(),
  texture: text("texture"),
  fragranceProfile: text("fragrance_profile"),
  ingredients: jsonb("ingredients").notNull(),
  // string[]
  careGoals: jsonb("care_goals").notNull(),
  // string[]
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow()
});
const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  displayName: text("display_name").notNull(),
  items: jsonb("items").notNull(),
  // OrderItem[]
  subtotal: doublePrecision("subtotal").notNull(),
  shipping: doublePrecision("shipping").notNull(),
  total: doublePrecision("total").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").default("Pending").notNull()
});
const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  answered: boolean("answered").default(false).notNull(),
  answeredAt: timestamp("answered_at")
});
const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  displayName: text("display_name"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}));
const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  })
}));
export {
  categories,
  contactMessages,
  orders,
  ordersRelations,
  products,
  reviews,
  users,
  usersRelations
};
