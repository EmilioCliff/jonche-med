# ChemStock Backend

This is the backend for ChemStock, a modern pharmacy inventory management system built with Go. It provides RESTful APIs for inventory, products, users, reports, and statistics, using PostgreSQL for data storage.

## Table of Contents

-   [Getting Started](#getting-started)
-   [Available Commands](#available-commands)
-   [Project Structure](#project-structure)
-   [Configuration](#configuration)
-   [Collaboration](#collaboration)

## Getting Started

To start working with this project, clone the repository, navigate into the backend directory, and install dependencies:

```sh
go mod tidy
```

Make sure you have **Go** and **PostgreSQL** installed on your system.

### Running the Project

After setting up, you can start the server:

```sh
go run cmd/server/main.go
```

## Available Commands

In the backend directory, you can run:

```sh
make sqlc        # Generate SQL code
make test        # Run tests
make race-test   # Run tests with race detector
```

## Project Structure

-   `cmd/server/` — Main server entry point
-   `internal/handlers/` — HTTP handler functions
-   `internal/repository/` — Data access layer
-   `internal/services/` — Business logic
-   `internal/postgres/` — Database queries, migrations, models
-   `internal/reports/` — Report generation logic
-   `pkg/` — Utilities and helpers
-   `.envs/` — Environment configurations

## Configuration

Project configurations are set in environment variables and config files:

-   `.envs/.local/config.env` — Local environment config
-   `.envs/configs/sqlc.yaml` — SQLC codegen config

## Collaboration

Contributions are welcome! To add features, improve docs, or fix bugs:

1. Fork the repository
2. Create a new branch (e.g. `feature/new-feature`)
3. Commit your changes with clear messages
4. Open a pull request

### Ways to Contribute

-   Add new API endpoints or CLI commands
-   Integrate new databases or improve queries
-   Write more tests and improve coverage
-   Enhance CI/CD workflows

If you have ideas or suggestions, open an issue or start a discussion. We appreciate your input!
