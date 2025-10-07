-- name: GetStats :one
SELECT * FROM stats
WHERE id = 1;

-- name: RecalculateStatsStock :exec
UPDATE stats
SET
    total_low_stock = subquery.low_stock,
    total_out_of_stock = subquery.out_of_stock
FROM (
    SELECT
        COUNT(*) FILTER (WHERE stock > 0 AND stock <= low_stock_threshold AND deleted = false) AS low_stock,
        COUNT(*) FILTER (WHERE stock <= 0 AND deleted = false) AS out_of_stock
    FROM products
) AS subquery
WHERE stats.id = 1;

-- name: UpdateStats :one
UPDATE stats
SET total_users = coalesce(sqlc.narg('total_users'), total_users),
    total_products = coalesce(sqlc.narg('total_products'), total_products),
    total_low_stock = coalesce(sqlc.narg('total_low_stock'), total_low_stock),
    total_out_of_stock = coalesce(sqlc.narg('total_out_of_stock'), total_out_of_stock),
    total_stocks_added = coalesce(sqlc.narg('total_stocks_added'), total_stocks_added),
    total_stocks_added_value = coalesce(sqlc.narg('total_stocks_added_value'), total_stocks_added_value),
    total_stocks_removed = coalesce(sqlc.narg('total_stocks_removed'), total_stocks_removed),
    total_stocks_removed_value = coalesce(sqlc.narg('total_stocks_removed_value'), total_stocks_removed_value),
    total_value = coalesce(sqlc.narg('total_value'), total_value)
WHERE id = 1
RETURNING *;