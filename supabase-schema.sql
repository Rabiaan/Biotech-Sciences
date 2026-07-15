-- Biotech Sciences — Supabase PostgreSQL schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users / profiles (synced from Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0 NOT NULL CHECK (count >= 0)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  price DOUBLE PRECISION NOT NULL CHECK (price >= 0),
  price_original DOUBLE PRECISION CHECK (price_original IS NULL OR price_original >= 0),
  on_sale BOOLEAN NOT NULL DEFAULT FALSE,
  sale_price DOUBLE PRECISION CHECK (sale_price IS NULL OR sale_price >= 0),
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '[]'::jsonb,
  volume TEXT,
  category TEXT NOT NULL,
  rating DOUBLE PRECISION NOT NULL DEFAULT 5 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  texture TEXT,
  fragrance_profile TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  care_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DOUBLE PRECISION NOT NULL CHECK (subtotal >= 0),
  shipping DOUBLE PRECISION NOT NULL CHECK (shipping >= 0),
  total DOUBLE PRECISION NOT NULL CHECK (total >= 0),
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')
  )
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders (user_email);
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  answered BOOLEAN DEFAULT FALSE NOT NULL,
  answered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_timestamp ON contact_messages (timestamp DESC);

-- Auto-update updated_at on users
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Default categories
INSERT INTO categories (name, count) VALUES
  ('Skincare', 132),
  ('Makeup', 247),
  ('Hair Care', 132),
  ('Body Rituals', 84),
  ('Wellness', 117)
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Users: read own profile; service role bypasses RLS
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Products & categories: public read
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);

-- Orders: users see own orders; admins see all (via service role on server)
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Contact messages: insert only for authenticated or anon via server
CREATE POLICY "contact_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Grant usage to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON products, categories TO anon, authenticated;
GRANT SELECT, INSERT ON orders TO authenticated;
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT INSERT ON contact_messages TO anon, authenticated;

-- Migration helper: add answered columns if upgrading from older schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_messages' AND column_name = 'answered'
  ) THEN
    ALTER TABLE contact_messages ADD COLUMN answered BOOLEAN DEFAULT FALSE NOT NULL;
    ALTER TABLE contact_messages ADD COLUMN answered_at TIMESTAMPTZ;
  END IF;
END $$;

-- Migration helper: add role column if upgrading from older schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
  END IF;
END $$;

-- Migration helper: add sale columns if upgrading from older schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'on_sale'
  ) THEN
    ALTER TABLE products ADD COLUMN on_sale BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sale_price'
  ) THEN
    ALTER TABLE products ADD COLUMN sale_price DOUBLE PRECISION CHECK (sale_price IS NULL OR sale_price >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sale_start'
  ) THEN
    ALTER TABLE products ADD COLUMN sale_start TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sale_end'
  ) THEN
    ALTER TABLE products ADD COLUMN sale_end TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================
-- Biotech Sciences — Admin, Auth, Inventory & Reporting Migration
-- Run AFTER the base schema. Safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP...CREATE).
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
-- ============================================================

-- ============================================================
-- 0. HELPER: is_admin() — used everywhere to gate admin-only actions
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin(uid TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = uid AND role = 'admin'
  );
$$ LANGUAGE sql STABLE;

-- ============================================================
-- 1. AUTH — track how the user signed in (google / apple / email)
--    and auto-create a public.users row whenever someone signs up
--    via Supabase Auth (Google, Apple, or email/password).
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT
  CHECK (auth_provider IN ('google', 'apple', 'email'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Trigger function: fires on every new row in the protected auth.users table
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, auth_provider, last_login)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET last_login = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Also bump last_login on every sign-in (not just first signup)
CREATE OR REPLACE FUNCTION handle_auth_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET last_login = NOW() WHERE id = NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_user_login();

-- ============================================================
-- 2. PRODUCTS & CATEGORIES — lock writes to admins only
-- ============================================================
DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert" ON products
  FOR INSERT WITH CHECK (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update" ON products
  FOR UPDATE USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete" ON products
  FOR DELETE USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
CREATE POLICY "categories_admin_insert" ON categories
  FOR INSERT WITH CHECK (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "categories_admin_update" ON categories;
CREATE POLICY "categories_admin_update" ON categories
  FOR UPDATE USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "categories_admin_delete" ON categories;
CREATE POLICY "categories_admin_delete" ON categories
  FOR DELETE USING (is_admin(auth.uid()::text));

GRANT INSERT, UPDATE, DELETE ON products, categories TO authenticated;

-- Keep category counts accurate automatically whenever a product
-- is added, removed, or moved to a different category.
CREATE OR REPLACE FUNCTION sync_category_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET count = count + 1 WHERE name = NEW.category;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET count = GREATEST(count - 1, 0) WHERE name = OLD.category;
  ELSIF TG_OP = 'UPDATE' AND NEW.category IS DISTINCT FROM OLD.category THEN
    UPDATE categories SET count = GREATEST(count - 1, 0) WHERE name = OLD.category;
    UPDATE categories SET count = count + 1 WHERE name = NEW.category;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_category_count ON products;
CREATE TRIGGER products_category_count
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION sync_category_count();

-- ============================================================
-- 3. ORDER ITEMS — normalized line items (in addition to the
--    existing orders.items JSONB snapshot) so you can run real
--    per-product / per-date reporting without parsing JSON.
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,      -- snapshot, survives product edits/deletion
  category TEXT,                    -- snapshot, for category-wise reports
  unit_price DOUBLE PRECISION NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total DOUBLE PRECISION NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items (created_at DESC);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text)
    OR is_admin(auth.uid()::text)
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text)
  );

GRANT SELECT, INSERT ON order_items TO authenticated;

-- Admins can see every order (not just their own)
DROP POLICY IF EXISTS "orders_admin_select_all" ON orders;
CREATE POLICY "orders_admin_select_all" ON orders
  FOR SELECT USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "orders_admin_update_status" ON orders;
CREATE POLICY "orders_admin_update_status" ON orders
  FOR UPDATE USING (is_admin(auth.uid()::text));

GRANT SELECT, UPDATE ON orders TO authenticated;

-- ============================================================
-- 4. INVENTORY MOVEMENTS — full audit ledger. Every stock change
--    (sale, manual restock, correction) is logged here, so stock
--    on `products` is always derivable/verifiable from history.
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('sale', 'restock', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,       -- negative for sales, positive for restocks
  resulting_stock INTEGER NOT NULL CHECK (resulting_stock >= 0),
  order_id TEXT REFERENCES orders (id) ON DELETE SET NULL,  -- populated for sale/return
  admin_id TEXT REFERENCES users (id) ON DELETE SET NULL,   -- populated for manual restock/adjustment
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_move_product_id ON inventory_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_inv_move_created_at ON inventory_movements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_move_type ON inventory_movements (change_type);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_admin_select" ON inventory_movements;
CREATE POLICY "inventory_admin_select" ON inventory_movements
  FOR SELECT USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "inventory_admin_insert" ON inventory_movements;
CREATE POLICY "inventory_admin_insert" ON inventory_movements
  FOR INSERT WITH CHECK (is_admin(auth.uid()::text) OR change_type = 'sale');
  -- 'sale' rows are inserted automatically by the trigger below (server-side), not by a human

GRANT SELECT, INSERT ON inventory_movements TO authenticated;

-- Automatically decrement stock + write a ledger row whenever an
-- order_items row is inserted (i.e. whenever a purchase happens).
CREATE OR REPLACE FUNCTION handle_order_item_stock()
RETURNS TRIGGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE products
    SET stock = GREATEST(stock - NEW.quantity, 0)
    WHERE id = NEW.product_id
    RETURNING stock INTO new_stock;

  IF new_stock IS NOT NULL THEN
    INSERT INTO inventory_movements (product_id, change_type, quantity_change, resulting_stock, order_id)
    VALUES (NEW.product_id, 'sale', -NEW.quantity, new_stock, NEW.order_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS order_item_stock_deduction ON order_items;
CREATE TRIGGER order_item_stock_deduction
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION handle_order_item_stock();

-- Admin-facing helper function for manual restocks/adjustments from the dashboard
CREATE OR REPLACE FUNCTION admin_adjust_stock(
  p_product_id TEXT,
  p_quantity_change INTEGER,
  p_change_type TEXT,   -- 'restock' or 'adjustment'
  p_admin_id TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Only admins can adjust stock';
  END IF;

  UPDATE products
    SET stock = GREATEST(stock + p_quantity_change, 0)
    WHERE id = p_product_id
    RETURNING stock INTO new_stock;

  INSERT INTO inventory_movements (product_id, change_type, quantity_change, resulting_stock, admin_id, notes)
  VALUES (p_product_id, p_change_type, p_quantity_change, new_stock, p_admin_id, p_notes);

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. REPORTING VIEWS — date-wise, user-wise, monthly, yearly
-- ============================================================

-- Daily sales summary
DROP VIEW IF EXISTS report_sales_daily;
CREATE VIEW report_sales_daily AS
SELECT
  DATE(o.timestamp) AS sale_date,
  COUNT(DISTINCT o.id) AS order_count,
  SUM(oi.quantity) AS units_sold,
  SUM(oi.line_total) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'Cancelled'
GROUP BY DATE(o.timestamp)
ORDER BY sale_date DESC;

-- Monthly sales summary
DROP VIEW IF EXISTS report_sales_monthly;
CREATE VIEW report_sales_monthly AS
SELECT
  DATE_TRUNC('month', o.timestamp)::date AS month,
  COUNT(DISTINCT o.id) AS order_count,
  SUM(oi.quantity) AS units_sold,
  SUM(oi.line_total) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'Cancelled'
GROUP BY DATE_TRUNC('month', o.timestamp)
ORDER BY month DESC;

-- Yearly sales summary
DROP VIEW IF EXISTS report_sales_yearly;
CREATE VIEW report_sales_yearly AS
SELECT
  DATE_TRUNC('year', o.timestamp)::date AS year,
  COUNT(DISTINCT o.id) AS order_count,
  SUM(oi.quantity) AS units_sold,
  SUM(oi.line_total) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'Cancelled'
GROUP BY DATE_TRUNC('year', o.timestamp)
ORDER BY year DESC;

-- Per-user purchase history & lifetime value (tracked by email as requested)
DROP VIEW IF EXISTS report_sales_by_user;
CREATE VIEW report_sales_by_user AS
SELECT
  o.user_email,
  o.display_name,
  COUNT(DISTINCT o.id) AS total_orders,
  SUM(oi.quantity) AS total_units_purchased,
  SUM(oi.line_total) AS lifetime_spend,
  MIN(o.timestamp) AS first_purchase,
  MAX(o.timestamp) AS last_purchase
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'Cancelled'
GROUP BY o.user_email, o.display_name
ORDER BY lifetime_spend DESC;

-- Per-product performance (best sellers, revenue per product)
DROP VIEW IF EXISTS report_sales_by_product;
CREATE VIEW report_sales_by_product AS
SELECT
  oi.product_id,
  oi.product_name,
  oi.category,
  SUM(oi.quantity) AS units_sold,
  SUM(oi.line_total) AS revenue,
  COUNT(DISTINCT oi.order_id) AS order_count
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status <> 'Cancelled'
GROUP BY oi.product_id, oi.product_name, oi.category
ORDER BY revenue DESC;

-- Live inventory snapshot with low-stock flag
DROP VIEW IF EXISTS report_current_inventory;
CREATE VIEW report_current_inventory AS
SELECT
  p.id,
  p.name,
  p.category,
  p.stock,
  CASE WHEN p.stock <= 10 THEN true ELSE false END AS low_stock,
  (SELECT MAX(created_at) FROM inventory_movements im WHERE im.product_id = p.id) AS last_movement_at
FROM products p
ORDER BY p.stock ASC;

-- Full movement ledger, human-readable (for an admin "stock history" screen)
DROP VIEW IF EXISTS report_inventory_ledger;
CREATE VIEW report_inventory_ledger AS
SELECT
  im.id,
  im.created_at,
  p.name AS product_name,
  im.change_type,
  im.quantity_change,
  im.resulting_stock,
  im.order_id,
  u.display_name AS adjusted_by,
  im.notes
FROM inventory_movements im
JOIN products p ON p.id = im.product_id
LEFT JOIN users u ON u.id = im.admin_id
ORDER BY im.created_at DESC;

-- Reporting views inherit RLS from underlying tables, but views themselves
-- need explicit grants:
GRANT SELECT ON
  report_sales_daily, report_sales_monthly, report_sales_yearly,
  report_sales_by_user, report_sales_by_product,
  report_current_inventory, report_inventory_ledger
TO authenticated;

-- ============================================================
-- 6. PRIVILEGES — let the service-role key (used by server/seed/admin
--    scripts over HTTPS) read & write every table. Without this, writes via
--    the service_role key fail with "permission denied". Idempotent.
-- ============================================================
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role;
