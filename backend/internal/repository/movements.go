package repository

import (
	"github.com/EmilioCliff/jonche-med/pkg"
)

type Movement struct {
	ID          uint32
	ProductID   uint32
	Quantity    int64
	Price       float64
	Type        string
	Note        *string
	PerformedBy uint32
	CreatedAt   string

	// Related fields
	ProductName string
	UserName    string
}

type MovementFilter struct {
	Pagination *pkg.Pagination
	ProductID  *uint32
	Type       *string
	StartDate  *string
	EndDate    *string
}
