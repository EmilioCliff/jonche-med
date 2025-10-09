package handlers

import (
	"github.com/EmilioCliff/jonche-med/pkg"
	"github.com/gin-gonic/gin"
)

func (s *Server) GetDashboardData(ctx *gin.Context) {
	data, err := s.repo.ProductsRepository.GetDashboardData(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(200, gin.H{"data": data})
}
