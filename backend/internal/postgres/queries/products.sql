-- name: CreateProduct :one
INSERT INTO products (name, description, price, stock, category, unit, low_stock_threshold)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetProductByID :one
SELECT * FROM products WHERE id = $1 AND deleted = false;

-- name: UpdateProduct :one
UPDATE products
SET name = coalesce(sqlc.narg('name'), name),
    description = coalesce(sqlc.narg('description'), description),
    price = coalesce(sqlc.narg('price'), price),
    category = coalesce(sqlc.narg('category'), category),
    unit = coalesce(sqlc.narg('unit'), unit),
    low_stock_threshold = coalesce(sqlc.narg('low_stock_threshold'), low_stock_threshold)
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: AddStock :one
UPDATE products
SET stock = stock + sqlc.arg('quantity')
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: RemoveStock :one
UPDATE products
SET stock = stock - sqlc.arg('quantity')
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteProduct :exec
UPDATE products
SET deleted = true
WHERE id = $1;

-- name: ProductHelpers :many
SELECT id, name FROM products
WHERE deleted = false
ORDER BY name;

-- name: ListProducts :many
SELECT * FROM products
WHERE 
    (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
        OR LOWER(description) LIKE sqlc.narg('search')
        OR LOWER(category) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('in_stock')::boolean IS NULL
        OR (
            CASE 
                WHEN sqlc.narg('in_stock')::boolean = TRUE THEN stock > low_stock_threshold
                WHEN sqlc.narg('in_stock')::boolean = FALSE THEN stock <= low_stock_threshold
                ELSE TRUE
            END
        )
    )
    AND deleted = false
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: ListProductsCount :one
SELECT COUNT(*) AS total_products
FROM products
WHERE
    (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
        OR LOWER(description) LIKE sqlc.narg('search')
        OR LOWER(category) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('in_stock')::boolean IS NULL
        OR (
            CASE 
                WHEN sqlc.narg('in_stock')::boolean = TRUE THEN stock > low_stock_threshold
                WHEN sqlc.narg('in_stock')::boolean = FALSE THEN stock <= low_stock_threshold
                ELSE TRUE
            END
        )
    )
    AND deleted = false;