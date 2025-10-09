package repository

import (
	"context"
	"time"

	"github.com/EmilioCliff/jonche-med/pkg"
)

type Product struct {
	ID                uint32    `json:"id"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	Price             float64   `json:"price"`
	Stock             int64     `json:"stock"`
	Category          string    `json:"category"`
	Unit              string    `json:"unit"`
	LowStockThreshold int32     `json:"low_stock_threshold"`
	Deleted           bool      `json:"deleted"`
	CreatedAt         time.Time `json:"created_at"`
}

type ProductUpdate struct {
	Name              *string  `json:"name"`
	Description       *string  `json:"description"`
	Price             *float64 `json:"price"`
	Category          *string  `json:"category"`
	Unit              *string  `json:"unit"`
	LowStockThreshold *int32   `json:"low_stock_threshold"`
}

type ProductStockUpdate struct {
	ID          uint32
	PerformedBy uint32
	Quantity    int64
	Note        *string
	BatchNumber *string
}

type ProductFilter struct {
	Pagination *pkg.Pagination
	Search     *string
	Status     *string
}

type ProductRepository interface {
	Create(ctx context.Context, product *Product) (*Product, error)
	GetByID(ctx context.Context, id int64) (*Product, error)
	Update(ctx context.Context, id int64, productUpdate *ProductUpdate) (*Product, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *ProductFilter) ([]*Product, *pkg.Pagination, error)

	// For stock movements
	AddStock(ctx context.Context, data *ProductStockUpdate) (*Product, error)
	RemoveStock(ctx context.Context, data *ProductStockUpdate) (*Product, error)
	ListMovements(ctx context.Context, filter *MovementFilter) ([]*Movement, *pkg.Pagination, error)

	// Stats
	GetStats(ctx context.Context) (*Stats, error)
	ProductFormHeper(ctx context.Context) (any, error)
	GetDashboardData(ctx context.Context) (map[string]any, error)
}
