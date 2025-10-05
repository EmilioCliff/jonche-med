DATABASE_URL=postgres://backend:secret@localhost:5432/jonche-med?sslmode=disable
MIGRATIONS_PATH=file:///home/emilio-cliff/jonche-med/backend/internal/postgres/migrations

test:
	go test -v ./...

race-test:
	go test -v -race ./...

coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -func=coverage.out 
	go tool cover -html=coverage.out -o coverage.html

sqlc:
	cd .envs/configs && sqlc generate

run:
	cd cmd/server && go run main.go

build:
	cd cmd/server && go build -o main .

mock:
	mockgen -package mockdb -destination ./internal/mock/mockdb.go github.com/EmilioCliff/jonche-med/backend/internal/postgres/generated Querier

createMigrate:
	migrate create -ext sql -dir ./internal/postgres/migrations/ -seq $(NAME)

migrateUp:
	migrate -source ${MIGRATIONS_PATH} -database ${DATABASE_URL} -verbose up

migrateDown:
	migrate -source ${MIGRATIONS_PATH} -database ${DATABASE_URL} -verbose down

createDb:
	docker run --name jonche_med-db -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=backend -e POSTGRES_DB=jonche-med -p 5432:5432 -d 0150e3200277

createRedis:
	docker run --name jonche_med-redis -p 6379:6379 -d e1618a841b34

.PHONY: test race-test sqlc run coverage build mock createMigrate migrateUp migrateDown createDb createRedis
	