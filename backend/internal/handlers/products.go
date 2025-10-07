package handlers

import (
	"net/http"
	"time"

	"github.com/EmilioCliff/jonche-med/internal/repository"
	"github.com/EmilioCliff/jonche-med/pkg"
	"github.com/gin-gonic/gin"
)

type createProductRequest struct {
	Name              string  `json:"name" binding:"required"`
	Description       string  `json:"description" binding:"required"`
	Price             float64 `json:"price" binding:"required,gt=0"`
	Stock             int64   `json:"stock" binding:"required,gte=0"`
	Category          string  `json:"category" binding:"required"`
	Unit              string  `json:"unit" binding:"required"`
	LowStockThreshold int32   `json:"low_stock_threshold" binding:"required,gte=0"`
}

func (s *Server) createProductHandler(ctx *gin.Context) {
	var req createProductRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	product := &repository.Product{
		Name:              req.Name,
		Description:       req.Description,
		Price:             req.Price,
		Stock:             req.Stock,
		Category:          req.Category,
		Unit:              req.Unit,
		LowStockThreshold: req.LowStockThreshold,
	}

	createdProduct, err := s.repo.ProductsRepository.Create(ctx, product)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// invalidate products cache

	ctx.JSON(http.StatusOK, gin.H{"data": createdProduct})
}

func (s *Server) updateProductHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid product ID: %s", err.Error())))
		return
	}

	var req repository.ProductUpdate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	updatedProduct, err := s.repo.ProductsRepository.Update(ctx, id, &req)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// invalidate products cache

	ctx.JSON(http.StatusOK, gin.H{"data": updatedProduct})
}

func (s *Server) deleteProductHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid product ID: %s", err.Error())))
		return
	}

	if err := s.repo.ProductsRepository.Delete(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// invalidate products cache

	ctx.JSON(http.StatusOK, gin.H{"data": "product deleted"})
}

func (s *Server) listProductsHandler(ctx *gin.Context) {
	pageNoStr := ctx.DefaultQuery("page", "1")
	pageNo, err := pkg.StringToInt64(pageNoStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	pageSizeStr := ctx.DefaultQuery("limit", "10")
	pageSize, err := pkg.StringToInt64(pageSizeStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	filter := &repository.ProductFilter{
		Pagination: &pkg.Pagination{
			Page:     uint32(pageNo),
			PageSize: uint32(pageSize),
		},
		Search: nil,
		Status: nil,
	}

	if search := ctx.Query("search"); search != "" {
		filter.Search = &search
	}

	if status := ctx.Query("status"); status != "" {
		filter.Status = &status
	}

	products, pagination, err := s.repo.ProductsRepository.List(ctx, filter)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":       products,
		"pagination": pagination,
	})
}

type stockUpdateRequest struct {
	Quantity int64   `json:"quantity" binding:"required,gt=0"`
	Note     *string `json:"note"`
}

func (s *Server) addProductStockHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid product ID: %s", err.Error())))
		return
	}

	var req stockUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	// get user from context
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get auth payload")))
		return
	}
	payload := authPayload.(*pkg.Payload)

	data := &repository.ProductStockUpdate{
		ID:          uint32(id),
		PerformedBy: payload.UserID,
		Quantity:    req.Quantity,
		Note:        req.Note,
	}

	updatedProduct, err := s.repo.ProductsRepository.AddStock(ctx, data)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// invalidate products cache

	ctx.JSON(http.StatusOK, gin.H{"data": updatedProduct})
}

func (s *Server) removeProductStockHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid product ID: %s", err.Error())))
		return
	}

	var req stockUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	// get user from context
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get auth payload")))
		return
	}
	payload := authPayload.(*pkg.Payload)

	data := &repository.ProductStockUpdate{
		ID:          uint32(id),
		PerformedBy: payload.UserID,
		Quantity:    req.Quantity,
		Note:        req.Note,
	}

	updatedProduct, err := s.repo.ProductsRepository.RemoveStock(ctx, data)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// invalidate products cache

	ctx.JSON(http.StatusOK, gin.H{"data": updatedProduct})
}

func (s *Server) listProductMovementsHandler(ctx *gin.Context) {
	pageNoStr := ctx.DefaultQuery("page", "1")
	pageNo, err := pkg.StringToInt64(pageNoStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	pageSizeStr := ctx.DefaultQuery("limit", "10")
	pageSize, err := pkg.StringToInt64(pageSizeStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	filter := &repository.MovementFilter{
		Pagination: &pkg.Pagination{
			Page:     uint32(pageNo),
			PageSize: uint32(pageSize),
		},
		ProductID: nil,
		Type:      nil,
		StartDate: nil,
		EndDate:   nil,
	}

	if productIDStr := ctx.Query("product_id"); productIDStr != "" {
		productID, err := pkg.StringToInt64(productIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid product ID: %s", err.Error())))

			return
		}
		pid := uint32(productID)
		filter.ProductID = &pid
	}

	if movementType := ctx.Query("type"); movementType != "" {
		filter.Type = &movementType
	}

	startDateStr := ctx.DefaultQuery("from", "01/01/2025")
	startDate, err := pkg.StringToTime(startDateStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid start date: %s", err.Error())))

		return
	}
	filter.StartDate = &startDate

	toDateStr := ctx.DefaultQuery("to", time.Now().Add(time.Hour*24).Format("01/02/2006"))
	endDate, err := pkg.StringToTime(toDateStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid end date: %s", err.Error())))

		return
	}
	filter.EndDate = &endDate

	movements, pagination, err := s.repo.ProductsRepository.ListMovements(ctx, filter)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":       movements,
		"pagination": pagination,
	})
}

func (s *Server) getStatsHandler(ctx *gin.Context) {
	stats, err := s.repo.ProductsRepository.GetStats(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": stats})
}
