package repository

import (
	"context"

	"github.com/EmilioCliff/jonche-med/pkg"
)

type Product struct {
	ID                uint32
	Name              string
	Description       string
	Price             float64
	Stock             int64
	Category          string
	Unit              string
	LowStockThreshold int64
	Deleted           bool
	CreatedAt         string
}

type ProductUpdate struct {
	Name              *string
	Description       *string
	Price             *float64
	Category          *string
	Unit              *string
	LowStockThreshold *int64
}

type ProductStockUpdate struct {
	ID          uint32
	PerformedBy uint32
	Quantity    int64
	Note        *string
}

type ProductFilter struct {
	Pagination *pkg.Pagination
	Search     *string
	Status     *string
}

type ProductRepository interface {
	Create(ctx context.Context, product *Product) (*Product, error)
	Update(ctx context.Context, id int64, productUpdate *ProductUpdate) (*Product, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *ProductFilter) ([]*Product, *pkg.Pagination, error)

	// For stock movements
	AddStock(ctx context.Context, id int64, amount int64) (*Product, error)
	RemoveStock(ctx context.Context, id int64, amount int64) (*Product, error)
	ListMovements(ctx context.Context, filter *MovementFilter) ([]*Movement, *pkg.Pagination, error)

	// Stats
	GetStats(ctx context.Context) (*Stats, error)
}
