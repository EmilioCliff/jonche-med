package postgres

import (
	"context"

	"github.com/EmilioCliff/jonche-med/internal/postgres/generated"
	"github.com/EmilioCliff/jonche-med/internal/repository"
	"github.com/EmilioCliff/jonche-med/pkg"
)

var _ repository.ProductRepository = (*ProductRepository)(nil)

type ProductRepository struct {
	queries *generated.Queries
	db      *Store
}

func NewProductRepository(db *Store) *ProductRepository {
	return &ProductRepository{
		db:      db,
		queries: generated.New(db.pool),
	}
}

func (pr *ProductRepository) Create(ctx context.Context, product *repository.Product) (*repository.Product, error) {
}

func (pr *ProductRepository) Update(ctx context.Context, id int64, productUpdate *repository.ProductUpdate) (*repository.Product, error) {
}

func (pr *ProductRepository) Delete(ctx context.Context, id int64) error {}

func (pr *ProductRepository) List(ctx context.Context, filter *repository.ProductFilter) ([]*repository.Product, *pkg.Pagination, error) {
}

func (pr *ProductRepository) AddStock(ctx context.Context, id int64, amount int64) (*repository.Product, error) {
}

func (pr *ProductRepository) RemoveStock(ctx context.Context, id int64, amount int64) (*repository.Product, error) {
}

func (pr *ProductRepository) ListMovements(ctx context.Context, filter *repository.MovementFilter) ([]*repository.Movement, *pkg.Pagination, error) {
}

func (pr *ProductRepository) GetStats(ctx context.Context) (*repository.Stats, error) {}
