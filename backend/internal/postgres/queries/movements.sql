-- name: CreateMovement :one
INSERT INTO movements (product_id, quantity, price, type, note, batch_number, performed_by)
VALUES (sqlc.arg('product_id'), sqlc.arg('quantity'), sqlc.arg('price'), sqlc.arg('type'), sqlc.arg('note'), sqlc.narg('batch_number'), sqlc.arg('performed_by'))
RETURNING *;

-- name: GetMovementByID :one
SELECT * FROM movements WHERE id = $1;

-- name: ListMovements :many
SELECT 
    m.*,
    p.name AS product_name,
    u.name AS user_name
FROM movements AS m
JOIN products AS p ON p.id = m.product_id
JOIN users AS u ON u.id = m.performed_by
WHERE 
    (
        sqlc.narg('product_id')::bigint IS NULL 
        OR m.product_id = sqlc.narg('product_id')
    )
    AND (
        sqlc.narg('type')::text IS NULL 
        OR m.type = sqlc.narg('type')
    )
    AND (
        sqlc.narg('batch_number')::text IS NULL 
        OR m.batch_number = sqlc.narg('batch_number')
    )
    AND (
        sqlc.narg('start_date')::timestamptz IS NULL
        OR m.created_at BETWEEN sqlc.narg('start_date')::timestamptz 
            AND COALESCE(sqlc.narg('end_date')::timestamptz, now())
    )
ORDER BY m.created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');  

-- name: ListMovementsCount :one
SELECT COUNT(*) AS total_movements 
FROM movements
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
        sqlc.narg('batch_number')::text IS NULL 
        OR batch_number = sqlc.narg('batch_number')
    )
    AND (
        sqlc.narg('start_date')::timestamptz IS NULL
        OR created_at BETWEEN sqlc.narg('start_date')::timestamptz AND COALESCE(sqlc.narg('end_date')::timestamptz, now())
    );  
