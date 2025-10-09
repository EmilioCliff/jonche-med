package repository

import (
	"context"
	"time"

	"github.com/EmilioCliff/jonche-med/pkg"
)

const (
	ADMIN_ROLE = "admin"
	STAFF_ROLE = "staff"
)

type User struct {
	ID          uint32    `json:"id"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	PhoneNumber string    `json:"phone_number"`
	Role        string    `json:"role"`
	Deleted     bool      `json:"deleted"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserUpdate struct {
	Name         *string `json:"name"`
	Email        *string `json:"email"`
	PhoneNumber  *string `json:"phone_number"`
	Role         *string `json:"role"`
	Password     *string `json:"password"`
	RefreshToken *string `json:"refresh_token"`
}

type UserFilter struct {
	Pagination *pkg.Pagination
	Search     *string
	Role       *string
}

type UserRepository interface {
	Create(ctx context.Context, user *User, defaultPassword string) (*User, error)
	GetByID(ctx context.Context, id int64) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, id int64, userUpdate *UserUpdate) (*User, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *UserFilter) ([]*User, *pkg.Pagination, error)

	GetUserInternalByEmail(ctx context.Context, email string) (*User, string, string, error)
}
