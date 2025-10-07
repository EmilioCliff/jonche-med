-- name: CreateUser :one
INSERT INTO users (name, email, phone_number, role, password)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 AND deleted = false;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 AND deleted = false;

-- name: UpdateUser :one
UPDATE users
SET name = coalesce(sqlc.narg('name'), name),
    email = coalesce(sqlc.narg('email'), email),
    phone_number = coalesce(sqlc.narg('phone_number'), phone_number),
    role = coalesce(sqlc.narg('role'), role),
    refresh_token = coalesce(sqlc.narg('refresh_token'), refresh_token),
    password = coalesce(sqlc.narg('password'), password)
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteUser :exec
UPDATE users
SET deleted = true
WHERE id = $1;

-- name: ListUsers :many
SELECT * FROM users
WHERE 
    (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
        OR LOWER(email) LIKE sqlc.narg('search')
        OR LOWER(phone_number) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('role')::text IS NULL 
        OR role = sqlc.narg('role')
    )
    AND deleted = false
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: ListUsersCount :one
SELECT COUNT(*) AS total_users
FROM users
WHERE 
    (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
        OR LOWER(email) LIKE sqlc.narg('search')
        OR LOWER(phone_number) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('role')::text IS NULL 
        OR role = sqlc.narg('role')
    )
    AND deleted = false;