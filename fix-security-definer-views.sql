-- Fix SECURITY DEFINER View Errors
-- Run this in Supabase SQL Editor (Dashboard -> SQL -> New query)
-- This drops and recreates all 7 report views WITHOUT the SECURITY DEFINER property.

-- 1. Daily sales summary
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

-- 2. Monthly sales summary
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

-- 3. Yearly sales summary
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

-- 4. Per-user purchase history & lifetime value
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

-- 5. Per-product performance
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

-- 6. Live inventory snapshot with low-stock flag
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

-- 7. Full movement ledger
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

-- Re-grant SELECT to authenticated role
GRANT SELECT ON
  report_sales_daily, report_sales_monthly, report_sales_yearly,
  report_sales_by_user, report_sales_by_product,
  report_current_inventory, report_inventory_ledger
TO authenticated;
