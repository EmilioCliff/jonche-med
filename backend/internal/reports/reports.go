package reports

import (
	"github.com/EmilioCliff/jonche-med/internal/postgres"
	"github.com/EmilioCliff/jonche-med/internal/services"
)

var _ services.ReportService = (*ReportServiceImpl)(nil)

func NewReportService(store *postgres.PostgresRepo) services.ReportService {
	return &ReportServiceImpl{
		store: store,
	}
}

type ReportServiceImpl struct {
	store *postgres.PostgresRepo
}
