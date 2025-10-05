ALTER TABLE "movements" DROP CONSTRAINT "movements_product_id_fkey";
ALTER TABLE "movements" DROP CONSTRAINT "movements_performed_by_fkey";

DROP TABLE IF EXISTS "stats";
DROP TABLE IF EXISTS "movements";
DROP TABLE IF EXISTS "products";
DROP TABLE IF EXISTS "users";