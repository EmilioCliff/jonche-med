package handlers

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/EmilioCliff/jonche-med/internal/postgres"
	"github.com/EmilioCliff/jonche-med/internal/services"
	"github.com/EmilioCliff/jonche-med/pkg"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
	ln     net.Listener
	srv    *http.Server

	config     pkg.Config
	tokenMaker pkg.JWTMaker
	repo       *postgres.PostgresRepo

	cache  services.CacheService
	report services.ReportService
}

func NewServer(config pkg.Config, tokenMaker pkg.JWTMaker, repo *postgres.PostgresRepo, cache services.CacheService, report services.ReportService) *Server {
	if config.ENVIRONMENT == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	s := &Server{
		router: r,
		ln:     nil,

		config:     config,
		tokenMaker: tokenMaker,
		repo:       repo,

		cache:  cache,
		report: report,
	}

	s.setUpRoutes()

	return s
}

func (s *Server) setUpRoutes() {
	s.router.Use(CORSmiddleware(s.config.FRONTEND_URL))

	v1 := s.router.Group("/api/v1")
	v1Auth := s.router.Group("/api/v1")
	v1cache := s.router.Group("/api/v1")

	// protected routes
	authRoute := v1Auth.Use(authMiddleware(s.tokenMaker))

	// cached routes
	cacheRoute := v1cache.Use(authMiddleware(s.tokenMaker), redisCacheMiddleware(s.cache))

	// health check
	v1.GET("/health-check", s.healthCheckHandler)

	// users routes
	authRoute.POST("/users", s.createUserHandler)
	cacheRoute.GET("/users/:id", s.getUserHandler)
	authRoute.PUT("/users/:id", s.updateUserHandler)
	authRoute.DELETE("/users/:id", s.deleteUserHandler)
	cacheRoute.GET("/users", s.listUsersHandler)

	v1.POST("/users/login", s.loginUserHandler)
	v1.GET("/users/logout", s.logoutUserHandler)
	v1.GET("/users/refresh-token", s.refreshTokenHandler)
	authRoute.POST("/users/:id/change-password", s.changePasswordHandler)

	// products routes
	authRoute.POST("/products", s.createProductHandler)
	authRoute.PUT("/products/:id", s.updateProductHandler)
	authRoute.DELETE("/products/:id", s.deleteProductHandler)
	cacheRoute.GET("/products", s.listProductsHandler)

	authRoute.POST("/products/:id/add-stock", s.addProductStockHandler)
	authRoute.POST("/products/:id/remove-stock", s.removeProductStockHandler)
	cacheRoute.GET("/products/movements", s.listProductMovementsHandler)
	cacheRoute.GET("/stats", s.getStatsHandler)

	// reports routes

	s.srv = &http.Server{
		Addr:         s.config.SERVER_ADDRESS,
		Handler:      s.router.Handler(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
}

func (s *Server) healthCheckHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (s *Server) Start() error {
	var err error
	if s.ln, err = net.Listen("tcp", s.config.SERVER_ADDRESS); err != nil {
		return err
	}

	go func(s *Server) {
		err := s.srv.Serve(s.ln)
		if err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}(s)

	return nil
}

func (s *Server) Stop(ctx context.Context) error {
	log.Println("Shutting down http server...")

	return s.srv.Shutdown(ctx)
}

func (s *Server) GetPort() int {
	if s.ln == nil {
		return 0
	}

	return s.ln.Addr().(*net.TCPAddr).Port
}

func errorResponse(err error) gin.H {
	return gin.H{
		"status_code": pkg.ErrorCode(err),
		"message":     pkg.ErrorMessage(err),
	}
}

func constructCacheKey(path string, queryParams map[string][]string) string {
	const prefix = "/api/v1/"
	if ok := strings.HasPrefix(path, prefix); ok {
		path = strings.TrimPrefix(path, prefix)
	}

	var queryParts []string
	for key, values := range queryParams {
		for _, value := range values {
			queryParts = append(queryParts, fmt.Sprintf("%s=%s", key, value))
		}
	}
	sort.Strings(queryParts) // Sort to ensure cache key consistency

	return fmt.Sprintf("%s:%s", path, strings.Join(queryParts, ":"))
}
