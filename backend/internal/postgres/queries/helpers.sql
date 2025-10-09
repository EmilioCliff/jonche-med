-- name: GetDashboardData :one
WITH low_stock AS (
  SELECT id, name, stock, low_stock_threshold
  FROM products
  WHERE deleted = false
  ORDER BY stock ASC
  LIMIT 3
),
recent_stock_in AS (
  SELECT m.id, p.name AS product_name, m.quantity, m.price, m.created_at
  FROM movements m
  JOIN products p ON p.id = m.product_id
  WHERE m.type = 'ADD'
  ORDER BY m.created_at DESC
  LIMIT 5
),
recent_stock_out AS (
  SELECT m.id, p.name AS product_name, m.quantity, m.price, m.created_at
  FROM movements m
  JOIN products p ON p.id = m.product_id
  WHERE m.type = 'REMOVE'
  ORDER BY m.created_at DESC
  LIMIT 5
)
SELECT 
  json_build_object(
    'low_stock', (SELECT json_agg(low_stock) FROM low_stock),
    'recent_stock_in', (SELECT json_agg(recent_stock_in) FROM recent_stock_in),
    'recent_stock_out', (SELECT json_agg(recent_stock_out) FROM recent_stock_out)
  ) AS dashboard_data;

-- name: GetWeeklySales :many
WITH date_series AS (
  SELECT generate_series::date AS day
  FROM generate_series(
    (CURRENT_DATE - INTERVAL '6 days'),
    CURRENT_DATE,
    INTERVAL '1 day'
  )
),
sales_data AS (
  SELECT
    created_at::date AS day,
    SUM(quantity) AS sales,
    COUNT(*) AS total_transacted,
    SUM(price * quantity) AS total_amount
  FROM movements
  WHERE type = 'REMOVE'
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY created_at::date
)
SELECT
  to_char(ds.day, 'Dy') AS day,
  COALESCE(sd.sales, 0) AS sales,
  COALESCE(sd.total_transacted, 0) AS total_transacted,
  COALESCE(sd.total_amount, 0) AS total_amount
FROM date_series ds
LEFT JOIN sales_data sd ON ds.day = sd.day
ORDER BY ds.day;
