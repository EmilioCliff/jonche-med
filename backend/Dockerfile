# Build stage
FROM golang:1.24.7-alpine AS builder
WORKDIR /app
COPY . .

# install migrate
RUN apk add --no-cache curl
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar xvz

RUN go build -o main /app/cmd/server/main.go

# Run stage
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        tzdata \
        dnsutils \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/main .
COPY --from=builder /app/migrate ./migrate
COPY --from=builder /app/internal/postgres/migrations /app/migrations

EXPOSE 3031

CMD ["./main"]