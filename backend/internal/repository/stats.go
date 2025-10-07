package repository

type Stats struct {
	TotalUsers             int64   `json:"total_users"`
	TotalProducts          int64   `json:"total_products"`
	TotalLowStock          int64   `json:"total_low_stock"`
	TotalOutOfStock        int64   `json:"total_out_of_stock"`
	TotalStockAdded        int64   `json:"total_stocks_added"`
	TotalStockAddedValue   float64 `json:"total_stocks_added_value"`
	TotalStockRemoved      int64   `json:"total_stocks_removed"`
	TotalStockRemovedValue float64 `json:"total_stocks_removed_value"`
	TotalValue             float64 `json:"total_value"`
}
