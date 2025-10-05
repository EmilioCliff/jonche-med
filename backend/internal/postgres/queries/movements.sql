-- name: CreateMovement :one
INSERT INTO movements (product_id, quantity, price, type, note, performed_by)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetMovementByID :one
SELECT * FROM movements WHERE id = $1;

-- name: ListMovements :many
SELECT * FROM movements
WHERE 
    (
        sqlc.narg('product_id')::bigint IS NULL 
        OR product_id = sqlc.narg('product_id')
    )
    AND (
        sqlc.narg('type')::text IS NULL 
        OR type = sqlc.narg('type')
    )
    AND (
        sqlc.narg('start_date')::timestamptz IS NULL
        OR created_at BETWEEN sqlc.narg('start_date')::timestamptz AND COALESCE(sqlc.narg('end_date')::timestamptz, now())
    )
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');  
