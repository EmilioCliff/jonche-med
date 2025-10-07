CREATE TABLE "users" (
    "id" bigserial PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "email" varchar(50) UNIQUE NOT NULL,
    "phone_number" varchar(50) UNIQUE NOT NULL,
    "role" varchar(50) NOT NULL CHECK (role IN ('admin', 'staff')),
    "password" varchar(255) NOT NULL,
    "refresh_token" text,
    "deleted" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "products" (
    "id" bigserial PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "description" text,
    "price" numeric(10,2) NOT NULL,
    "stock" bigint NOT NULL,
    "category" varchar(50) NOT NULL,
    "unit" varchar(50) NOT NULL,
    "low_stock_threshold" integer NOT NULL DEFAULT 10,
    "deleted" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "movements" (
    "id" bigserial PRIMARY KEY,
    "product_id" bigint NOT NULL,
    "quantity" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "type" varchar(50) NOT NULL,
    "note" text,
    "performed_by" bigint NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT (now()),

    CONSTRAINT "movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id"),
    CONSTRAINT "movements_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users" ("id")
);

CREATE TABLE "stats" (
    "id" integer PRIMARY KEY,
    "total_users" bigint NOT NULL DEFAULT 0,
    "total_products" bigint NOT NULL DEFAULT 0,
    "total_low_stock" bigint NOT NULL DEFAULT 0,
    "total_out_of_stock" bigint NOT NULL DEFAULT 0,
    "total_stocks_added" bigint NOT NULL DEFAULT 0,
    "total_stocks_added_value" numeric(10,2) NOT NULL DEFAULT 0,
    "total_stocks_removed" bigint NOT NULL DEFAULT 0,
    "total_stocks_removed_value" numeric(10,2) NOT NULL DEFAULT 0,
    "total_value" numeric(14,2) NOT NULL DEFAULT 0
);

-- Initialize stats with a single row
INSERT INTO "stats" ("id")
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX idx_users_email ON "users" (email);
CREATE INDEX idx_products_name ON "products" (name);
CREATE INDEX idx_products_deleted ON "products" (deleted);
CREATE INDEX idx_movements_product_id ON "movements" (product_id);
CREATE INDEX idx_movements_performed_by ON "movements" (performed_by);
CREATE INDEX idx_movements_type ON "movements" (type);