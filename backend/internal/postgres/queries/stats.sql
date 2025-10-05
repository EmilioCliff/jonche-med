-- name: GetStats :one
SELECT * FROM stats
WHERE id = 1;

-- name: UpdateStats :one
UPDATE stats
SET total_users = coalesce(sqlc.narg('total_users'), total_users),
    total_products = coalesce(sqlc.narg('total_products'), total_products),
    total_low_stock = coalesce(sqlc.narg('total_low_stock'), total_low_stock),
    total_out_of_stock = coalesce(sqlc.narg('total_out_of_stock'), total_out_of_stock),
    total_stocks_added = coalesce(sqlc.narg('total_stocks_added'), total_stocks_added),
    total_stocks_removed = coalesce(sqlc.narg('total_stocks_removed'), total_stocks_removed),
    total_value = coalesce(sqlc.narg('total_value'), total_value)
WHERE id = sqlc.arg('id')
RETURNING *;