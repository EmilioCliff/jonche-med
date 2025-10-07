package postgres

import (
	"context"
	"strings"

	"github.com/EmilioCliff/jonche-med/internal/postgres/generated"
	"github.com/EmilioCliff/jonche-med/internal/repository"
	"github.com/EmilioCliff/jonche-med/pkg"
	"github.com/jackc/pgx/v5/pgtype"
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
	err := pr.db.ExecTx(ctx, func(q *generated.Queries) error {
		// create product
		createParams := generated.CreateProductParams{
			Name:              product.Name,
			Description:       pgtype.Text{Valid: false},
			Price:             pkg.Float64ToPgTypeNumeric(product.Price),
			Stock:             product.Stock,
			Category:          product.Category,
			Unit:              product.Unit,
			LowStockThreshold: product.LowStockThreshold,
		}

		if product.Description != "" {
			createParams.Description = pgtype.Text{String: product.Description, Valid: true}
		}

		p, err := q.CreateProduct(ctx, createParams)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create product: %s", err.Error())
		}
		product.ID = uint32(p.ID)
		product.CreatedAt = p.CreatedAt
		product.Deleted = p.Deleted

		// update stats
		stats, err := q.GetStats(ctx)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get stats: %s", err.Error())
		}

		var (
			newTotalProducts         = stats.TotalProducts + 1
			newTotalLowStock         *int64
			newTotalOutOfStock       *int64
			newTotalStocksAdded      *int64
			newTotalStocksAddedValue *float64
			newTotalValue            *float64
		)

		// Only update fields if conditions are met
		if p.Stock <= 0 {
			val := stats.TotalOutOfStock + 1
			newTotalOutOfStock = &val
		}
		if p.Stock > 0 && p.Stock <= int64(p.LowStockThreshold) {
			val := stats.TotalLowStock + 1
			newTotalLowStock = &val
		}
		if p.Stock > 0 {
			val := stats.TotalStocksAdded + p.Stock
			newTotalStocksAdded = &val

			valF := pkg.PgTypeNumericToFloat64(stats.TotalValue) + float64(p.Stock)*pkg.PgTypeNumericToFloat64(p.Price)
			newTotalValue = &valF
			newTotalStocksAddedValue = &valF
		}

		err = updateStatsHelper(
			ctx, q,
			nil, // totalUsers
			&newTotalProducts,
			newTotalLowStock,
			newTotalOutOfStock,
			newTotalStocksAdded,
			newTotalStocksAddedValue,
			nil, // totalStocksRemoved
			nil, // totalStocksRemovedValue
			newTotalValue,
		)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update stats: %s", err.Error())
		}

		return nil
	})
	return product, err
}

func (pr *ProductRepository) Update(ctx context.Context, id int64, productUpdate *repository.ProductUpdate) (*repository.Product, error) {
	updateParams := generated.UpdateProductParams{
		ID:                id,
		Name:              pgtype.Text{Valid: false},
		Description:       pgtype.Text{Valid: false},
		Price:             pgtype.Numeric{Valid: false},
		Category:          pgtype.Text{Valid: false},
		Unit:              pgtype.Text{Valid: false},
		LowStockThreshold: pgtype.Int4{Valid: false},
	}
	if productUpdate.Name != nil {
		updateParams.Name = pgtype.Text{String: *productUpdate.Name, Valid: true}
	}
	if productUpdate.Description != nil {
		updateParams.Description = pgtype.Text{String: *productUpdate.Description, Valid: true}
	}
	if productUpdate.Price != nil {
		updateParams.Price = pkg.Float64ToPgTypeNumeric(*productUpdate.Price)
	}
	if productUpdate.Category != nil {
		updateParams.Category = pgtype.Text{String: *productUpdate.Category, Valid: true}
	}
	if productUpdate.Unit != nil {
		updateParams.Unit = pgtype.Text{String: *productUpdate.Unit, Valid: true}
	}
	if productUpdate.LowStockThreshold != nil {
		updateParams.LowStockThreshold = pgtype.Int4{Int32: *productUpdate.LowStockThreshold, Valid: true}
	}

	p, err := pr.queries.UpdateProduct(ctx, updateParams)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update product: %s", err.Error())
	}

	return pgProductToRepoProduct(p), nil
}

func (pr *ProductRepository) Delete(ctx context.Context, id int64) error {
	err := pr.db.ExecTx(ctx, func(q *generated.Queries) error {
		err := q.DeleteProduct(ctx, id)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to delete product: %s", err.Error())
		}

		// update stats
		stats, err := q.GetStats(ctx)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get stats: %s", err.Error())
		}

		newTotalProducts := stats.TotalProducts - 1

		err = updateStatsHelper(
			ctx, q,
			nil, // totalUsers
			&newTotalProducts,
			nil, // totalLowStock
			nil, // totalOutOfStock
			nil, // totalStocksAdded
			nil, // totalStocksAddedValue
			nil, // totalStocksRemoved
			nil, // totalStocksRemovedValue
			nil, // totalValue
		)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update stats: %s", err.Error())
		}

		return nil
	})

	return err
}

func (pr *ProductRepository) List(ctx context.Context, filter *repository.ProductFilter) ([]*repository.Product, *pkg.Pagination, error) {
	listParams := generated.ListProductsParams{
		Limit:   int32(filter.Pagination.PageSize),
		Offset:  pkg.Offset(filter.Pagination.Page, filter.Pagination.PageSize),
		Search:  pgtype.Text{Valid: false},
		InStock: pgtype.Bool{Valid: false},
	}
	countParams := generated.ListProductsCountParams{
		Search:  pgtype.Text{Valid: false},
		InStock: pgtype.Bool{Valid: false},
	}

	if filter.Search != nil {
		s := strings.ToLower(*filter.Search)
		listParams.Search = pgtype.Text{String: "%" + s + "%", Valid: true}
		countParams.Search = pgtype.Text{String: "%" + s + "%", Valid: true}
	}
	if filter.Status != nil {
		if *filter.Status == "in_stock" {
			listParams.InStock = pgtype.Bool{Bool: true, Valid: true}
			countParams.InStock = pgtype.Bool{Bool: true, Valid: true}
		} else if *filter.Status == "out_of_stock" {
			listParams.InStock = pgtype.Bool{Bool: false, Valid: true}
			countParams.InStock = pgtype.Bool{Bool: false, Valid: true}
		}
	}

	products, err := pr.queries.ListProducts(ctx, listParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list products: %s", err.Error())
	}

	totalCount, err := pr.queries.ListProductsCount(ctx, countParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to count products: %s", err.Error())
	}

	repoProducts := make([]*repository.Product, len(products))
	for i, p := range products {
		repoProducts[i] = pgProductToRepoProduct(p)
	}

	return repoProducts, pkg.CalculatePagination(uint32(totalCount), filter.Pagination.PageSize, filter.Pagination.Page), nil
}

func (pr *ProductRepository) AddStock(ctx context.Context, data *repository.ProductStockUpdate) (*repository.Product, error) {
	var product *repository.Product
	err := pr.db.ExecTx(ctx, func(q *generated.Queries) error {
		// add stock
		p, err := q.AddStock(ctx, generated.AddStockParams{
			ID:       int64(data.ID),
			Quantity: data.Quantity,
		})
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to add stock: %s", err.Error())
		}
		product = pgProductToRepoProduct(p)

		// create movement
		movementParam := generated.CreateMovementParams{
			ProductID:   int64(data.ID),
			Quantity:    int32(data.Quantity),
			Price:       p.Price,
			Type:        repository.MOVEMENT_ADD,
			Note:        pgtype.Text{Valid: false},
			PerformedBy: int64(data.PerformedBy),
		}
		if data.Note != nil {
			movementParam.Note = pgtype.Text{String: *data.Note, Valid: true}
		}

		_, err = q.CreateMovement(ctx, movementParam)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create movement: %s", err.Error())
		}

		// update stats
		stats, err := q.GetStats(ctx)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get stats: %s", err.Error())
		}

		var (
			newTotalLowStock         *int64
			newTotalOutOfStock       *int64
			newTotalStocksAdded      *int64
			newTotalStocksAddedValue *float64
			newTotalValue            *float64
		)

		if p.Stock-data.Quantity <= 0 && p.Stock > 0 {
			val := stats.TotalOutOfStock - 1
			newTotalOutOfStock = &val
		}
		if p.Stock-data.Quantity > 0 && p.Stock-data.Quantity <= int64(p.LowStockThreshold) && p.Stock > int64(p.LowStockThreshold) {
			val := stats.TotalLowStock - 1
			newTotalLowStock = &val
		}

		val := stats.TotalStocksAdded + data.Quantity
		newTotalStocksAdded = &val

		valFA := pkg.PgTypeNumericToFloat64(stats.TotalStocksAddedValue) + float64(data.Quantity)*pkg.PgTypeNumericToFloat64(p.Price)
		newTotalStocksAddedValue = &valFA

		valF := pkg.PgTypeNumericToFloat64(stats.TotalValue) + float64(data.Quantity)*pkg.PgTypeNumericToFloat64(p.Price)
		newTotalValue = &valF

		err = updateStatsHelper(
			ctx, q,
			nil, // totalUsers
			nil, // totalProducts
			newTotalLowStock,
			newTotalOutOfStock,
			newTotalStocksAdded,
			newTotalStocksAddedValue,
			nil, // totalStocksRemoved
			nil, // totalStocksRemovedValue
			newTotalValue,
		)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update stats: %s", err.Error())
		}

		return nil
	})
	return product, err
}

func (pr *ProductRepository) RemoveStock(ctx context.Context, data *repository.ProductStockUpdate) (*repository.Product, error) {
	var product *repository.Product
	err := pr.db.ExecTx(ctx, func(q *generated.Queries) error {
		// remove stock
		p, err := q.RemoveStock(ctx, generated.RemoveStockParams{
			ID:       int64(data.ID),
			Quantity: data.Quantity,
		})
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to remove stock: %s", err.Error())
		}
		product = pgProductToRepoProduct(p)

		if p.Stock < 0 {
			return pkg.Errorf(pkg.INVALID_ERROR, "not enough stock to remove")
		}

		// create movement
		movementParam := generated.CreateMovementParams{
			ProductID:   int64(data.ID),
			Quantity:    int32(data.Quantity),
			Price:       p.Price,
			Type:        repository.MOVEMENT_REMOVE,
			Note:        pgtype.Text{Valid: false},
			PerformedBy: int64(data.PerformedBy),
		}
		if data.Note != nil {
			movementParam.Note = pgtype.Text{String: *data.Note, Valid: true}
		}

		_, err = q.CreateMovement(ctx, movementParam)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create movement: %s", err.Error())
		}

		// update stats
		stats, err := q.GetStats(ctx)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get stats: %s", err.Error())
		}

		var (
			newTotalLowStock           *int64
			newTotalOutOfStock         *int64
			newTotalStocksRemoved      *int64
			newTotalStocksRemovedValue *float64
			newTotalValue              *float64
		)

		if p.Stock+data.Quantity > 0 && p.Stock <= 0 {
			val := stats.TotalOutOfStock + 1
			newTotalOutOfStock = &val
		}
		if p.Stock+data.Quantity > int64(p.LowStockThreshold) && p.Stock <= int64(p.LowStockThreshold) && p.Stock > 0 {
			val := stats.TotalLowStock + 1
			newTotalLowStock = &val
		}

		val := stats.TotalStocksRemoved + data.Quantity
		newTotalStocksRemoved = &val

		valFA := pkg.PgTypeNumericToFloat64(stats.TotalStocksRemovedValue) + float64(data.Quantity)*pkg.PgTypeNumericToFloat64(p.Price)
		newTotalStocksRemovedValue = &valFA

		valF := pkg.PgTypeNumericToFloat64(stats.TotalValue) - float64(data.Quantity)*pkg.PgTypeNumericToFloat64(p.Price)
		newTotalValue = &valF

		err = updateStatsHelper(
			ctx, q,
			nil, // totalUsers
			nil, // totalProducts
			newTotalLowStock,
			newTotalOutOfStock,
			nil, // totalStocksAdded
			nil, // totalStocksAddedValue
			newTotalStocksRemoved,
			newTotalStocksRemovedValue,
			newTotalValue,
		)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update stats: %s", err.Error())
		}

		return nil
	})
	return product, err
}

func (pr *ProductRepository) ListMovements(ctx context.Context, filter *repository.MovementFilter) ([]*repository.Movement, *pkg.Pagination, error) {
	listParams := generated.ListMovementsParams{
		Limit:     int32(filter.Pagination.PageSize),
		Offset:    pkg.Offset(filter.Pagination.Page, filter.Pagination.PageSize),
		ProductID: pgtype.Int8{Valid: false},
		Type:      pgtype.Text{Valid: false},
		StartDate: pgtype.Timestamptz{Valid: false},
		EndDate:   pgtype.Timestamptz{Valid: false},
	}
	countParams := generated.ListMovementsCountParams{
		ProductID: pgtype.Int8{Valid: false},
		Type:      pgtype.Text{Valid: false},
		StartDate: pgtype.Timestamptz{Valid: false},
		EndDate:   pgtype.Timestamptz{Valid: false},
	}

	if filter.ProductID != nil {
		listParams.ProductID = pgtype.Int8{Int64: int64(*filter.ProductID), Valid: true}
		countParams.ProductID = pgtype.Int8{Int64: int64(*filter.ProductID), Valid: true}
	}
	if filter.Type != nil {
		listParams.Type = pgtype.Text{String: *filter.Type, Valid: true}
		countParams.Type = pgtype.Text{String: *filter.Type, Valid: true}
	}
	if filter.StartDate != nil && filter.EndDate != nil {
		listParams.StartDate = pgtype.Timestamptz{Time: *filter.StartDate, Valid: true}
		countParams.StartDate = pgtype.Timestamptz{Time: *filter.StartDate, Valid: true}

		listParams.EndDate = pgtype.Timestamptz{Time: *filter.EndDate, Valid: true}
		countParams.EndDate = pgtype.Timestamptz{Time: *filter.EndDate, Valid: true}
	}

	movements, err := pr.queries.ListMovements(ctx, listParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list movements: %s", err.Error())
	}

	totalCount, err := pr.queries.ListMovementsCount(ctx, countParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to count movements: %s", err.Error())
	}

	repoMovements := make([]*repository.Movement, len(movements))
	for i, m := range movements {
		var note *string
		if m.Note.Valid {
			note = &m.Note.String
		}

		repoMovements[i] = &repository.Movement{
			ID:          uint32(m.ID),
			ProductID:   uint32(m.ProductID),
			Quantity:    m.Quantity,
			Price:       pkg.PgTypeNumericToFloat64(m.Price),
			Type:        m.Type,
			Note:        note,
			PerformedBy: uint32(m.PerformedBy),
			CreatedAt:   m.CreatedAt,

			ProductName: m.ProductName,
			UserName:    m.UserName,
		}
	}

	return repoMovements, pkg.CalculatePagination(uint32(totalCount), filter.Pagination.PageSize, filter.Pagination.Page), nil
}

func (pr *ProductRepository) GetStats(ctx context.Context) (*repository.Stats, error) {
	stats, err := pr.queries.GetStats(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get stats: %s", err.Error())
	}

	return &repository.Stats{
		TotalUsers:             stats.TotalUsers,
		TotalProducts:          stats.TotalProducts,
		TotalLowStock:          stats.TotalLowStock,
		TotalOutOfStock:        stats.TotalOutOfStock,
		TotalStockAdded:        stats.TotalStocksAdded,
		TotalStockAddedValue:   pkg.PgTypeNumericToFloat64(stats.TotalStocksAddedValue),
		TotalStockRemoved:      stats.TotalStocksRemoved,
		TotalStockRemovedValue: pkg.PgTypeNumericToFloat64(stats.TotalStocksRemovedValue),
		TotalValue:             pkg.PgTypeNumericToFloat64(stats.TotalValue),
	}, nil
}

func updateStatsHelper(
	ctx context.Context,
	q *generated.Queries,
	totalUsers *int64,
	totalProducts *int64,
	totalLowStock *int64,
	totalOutOfStock *int64,
	totalStocksAdded *int64,
	totalStocksAddedValue *float64,
	totalStocksRemoved *int64,
	totalStocksRemovedValue *float64,
	totalValue *float64,
) error {
	params := generated.UpdateStatsParams{}

	if totalUsers != nil {
		params.TotalUsers = pgtype.Int8{Valid: true, Int64: *totalUsers}
	}
	if totalProducts != nil {
		params.TotalProducts = pgtype.Int8{Valid: true, Int64: *totalProducts}
	}
	if totalLowStock != nil {
		params.TotalLowStock = pgtype.Int8{Valid: true, Int64: *totalLowStock}
	}
	if totalOutOfStock != nil {
		params.TotalOutOfStock = pgtype.Int8{Valid: true, Int64: *totalOutOfStock}
	}
	if totalStocksAdded != nil {
		params.TotalStocksAdded = pgtype.Int8{Valid: true, Int64: *totalStocksAdded}
	}
	if totalStocksAddedValue != nil {
		params.TotalStocksAddedValue = pkg.Float64ToPgTypeNumeric(*totalStocksAddedValue)
	}
	if totalStocksRemoved != nil {
		params.TotalStocksRemoved = pgtype.Int8{Valid: true, Int64: *totalStocksRemoved}
	}
	if totalStocksRemovedValue != nil {
		params.TotalStocksRemovedValue = pkg.Float64ToPgTypeNumeric(*totalStocksRemovedValue)
	}
	if totalValue != nil {
		params.TotalValue = pkg.Float64ToPgTypeNumeric(*totalValue)
	}

	_, err := q.UpdateStats(ctx, params)
	return err
}

func pgProductToRepoProduct(p generated.Product) *repository.Product {
	return &repository.Product{
		ID:                uint32(p.ID),
		Name:              p.Name,
		Description:       p.Description.String,
		Price:             pkg.PgTypeNumericToFloat64(p.Price),
		Stock:             p.Stock,
		Category:          p.Category,
		Unit:              p.Unit,
		LowStockThreshold: p.LowStockThreshold,
		Deleted:           p.Deleted,
		CreatedAt:         p.CreatedAt,
	}
}
