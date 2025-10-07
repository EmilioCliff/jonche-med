CREATE OR REPLACE FUNCTION recalc_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stats
  SET
      total_low_stock = subquery.low_stock,
      total_out_of_stock = subquery.out_of_stock,
      total_value = subquery.total_value
  FROM (
      SELECT
          COUNT(*) FILTER (WHERE stock > 0 AND stock <= low_stock_threshold AND deleted = false) AS low_stock,
          COUNT(*) FILTER (WHERE stock <= 0 AND deleted = false) AS out_of_stock,
          COALESCE(SUM(price * stock), 0) AS total_value
      FROM products
      WHERE deleted = false
  ) AS subquery
  WHERE stats.id = 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_stats
AFTER UPDATE OF price, deleted, low_stock_threshold ON products
FOR EACH STATEMENT
EXECUTE FUNCTION recalc_stats();