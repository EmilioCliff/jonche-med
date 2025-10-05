package postgres

import (
	"context"

	"github.com/EmilioCliff/jonche-med/internal/postgres/generated"
	"github.com/EmilioCliff/jonche-med/internal/repository"
	"github.com/EmilioCliff/jonche-med/pkg"
)

var _ repository.UserRepository = (*UserRepository)(nil)

type UserRepository struct {
	queries *generated.Queries
}

func NewUserRepository(queries *generated.Queries) *UserRepository {
	return &UserRepository{queries: queries}
}

func (ur *UserRepository) Create(ctx context.Context, user *repository.User) (*repository.User, error) {
}

func (ur *UserRepository) GetByID(ctx context.Context, id uint32) (*repository.User, error) {}

func (ur *UserRepository) GetByEmail(ctx context.Context, email string) (*repository.User, error) {}

func (ur *UserRepository) Update(ctx context.Context, id uint32, userUpdate *repository.UserUpdate) (*User, error) {
}

func (ur *UserRepository) Delete(ctx context.Context, id uint32) error {}

func (ur *UserRepository) List(ctx context.Context, filter *repository.UserFilter) ([]*repository.User, *pkg.Pagination, error) {
}
