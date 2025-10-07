package repository

import (
	"time"

	"github.com/EmilioCliff/jonche-med/pkg"
)

const (
	MOVEMENT_ADD    = "ADD"
	MOVEMENT_REMOVE = "REMOVE"
)

type Movement struct {
	ID          uint32    `json:"id"`
	ProductID   uint32    `json:"product_id"`
	Quantity    int32     `json:"quantity"`
	Price       float64   `json:"price"`
	Type        string    `json:"type"`
	Note        *string   `json:"note"`
	PerformedBy uint32    `json:"performed_by"`
	CreatedAt   time.Time `json:"created_at"`

	// Related fields
	ProductName string `json:"product_name"`
	UserName    string `json:"user_name"`
}

type MovementFilter struct {
	Pagination *pkg.Pagination
	ProductID  *uint32
	Type       *string
	StartDate  *time.Time
	EndDate    *time.Time
}
