package repository

import (
	"context"
	"time"

	"github.com/EmilioCliff/jonche-med/pkg"
)

type User struct {
	ID          uint32
	Name        string
	Email       string
	PhoneNumber string
	Role        string
	Password    string
	Deleted     bool
	CreatedAt   time.Time
}

type UserUpdate struct {
	Name        *string
	Email       *string
	PhoneNumber *string
	Role        *string
	Password    *string
}

type UserFilter struct {
	Pagination *pkg.Pagination
	Search     *string
	Role       *string
}

type UserRepository interface {
	Create(ctx context.Context, user *User) (*User, error)
	GetByID(ctx context.Context, id uint32) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, id uint32, userUpdate *UserUpdate) (*User, error)
	Delete(ctx context.Context, id uint32) error
	List(ctx context.Context, filter *UserFilter) ([]*User, *pkg.Pagination, error)
}
