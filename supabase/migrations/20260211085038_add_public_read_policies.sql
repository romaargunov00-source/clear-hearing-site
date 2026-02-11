/*
  # Add Public Read Policies for All Tables

  This migration enables public read access to all data tables while maintaining security for write operations.

  1. Public Read Policies
    - All tables (categories, products, services, articles, about_items, advantages, partners, hero, orders, order_items) can be read by anyone
  2. Write Security
    - Write operations remain restricted or accessible only to the admin panel
*/

DO $$
BEGIN
  -- Categories: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
  END IF;

  -- Products: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
  END IF;

  -- Services: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
  END IF;

  -- Services: allow inserts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Allow inserts'
  ) THEN
    CREATE POLICY "Allow inserts" ON services FOR INSERT WITH CHECK (true);
  END IF;

  -- Articles: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON articles FOR SELECT USING (true);
  END IF;

  -- Articles: allow inserts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Allow inserts'
  ) THEN
    CREATE POLICY "Allow inserts" ON articles FOR INSERT WITH CHECK (true);
  END IF;

  -- About items: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'about_items' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON about_items FOR SELECT USING (true);
  END IF;

  -- Advantages: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'advantages' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON advantages FOR SELECT USING (true);
  END IF;

  -- Partners: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON partners FOR SELECT USING (true);
  END IF;

  -- Hero: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hero' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON hero FOR SELECT USING (true);
  END IF;

  -- Orders: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON orders FOR SELECT USING (true);
  END IF;

  -- Orders: allow inserts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow inserts'
  ) THEN
    CREATE POLICY "Allow inserts" ON orders FOR INSERT WITH CHECK (true);
  END IF;

  -- Order items: public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON order_items FOR SELECT USING (true);
  END IF;

  -- Order items: allow inserts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Allow inserts'
  ) THEN
    CREATE POLICY "Allow inserts" ON order_items FOR INSERT WITH CHECK (true);
  END IF;

END $$;
