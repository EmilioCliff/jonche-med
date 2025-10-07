package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/EmilioCliff/jonche-med/internal/cache"
	"github.com/EmilioCliff/jonche-med/internal/handlers"
	"github.com/EmilioCliff/jonche-med/internal/postgres"
	"github.com/EmilioCliff/jonche-med/internal/reports"
	"github.com/EmilioCliff/jonche-med/pkg"
)

func main() {
	// Setup signal handlers.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	config, err := pkg.LoadConfig("/home/emilio-cliff/jonche-med/backend/.envs/.local")
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	tokenMaker := pkg.NewJWTMaker(config.TOKEN_SYMMETRIC_KEY, config.TOKEN_ISSUER)
	if err != nil {
		log.Fatalf("Error creating token maker: %v", err)
	}

	// open database
	store := postgres.NewStore(config)
	err = store.OpenDB(context.Background())
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	// initialize repository
	postgresRepo := postgres.NewPostgresRepo(store)

	// create services
	cache := cache.NewCacheClient(config.REDIS_ADDRESS, config.REDIS_PASSWORD, 1)
	report := reports.NewReportService(postgresRepo)

	// start server
	server := handlers.NewServer(config, tokenMaker, postgresRepo, cache, report)
	log.Println("starting server at address: ", config.SERVER_ADDRESS)
	if err := server.Start(); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

	<-quit

	signal.Stop(quit)

	log.Println("shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Stop(ctx); err != nil {
		log.Fatalf("Error stopping server: %v", err)
	}

	store.CloseDB()

	log.Println("Server shutdown ...")
}
