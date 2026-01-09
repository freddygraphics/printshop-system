-- ===========================================
-- 🔧 DATABASE UPDATE SCRIPT FOR PRINTSHOP APP
-- ===========================================

-- 🧱 Ensure all main tables exist (no error if already created)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  base_price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_options (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  values JSONB,
  price_modifier JSONB,
  required BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES clients(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'Design',
  total_price DECIMAL(10,2) DEFAULT 0,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  options JSONB
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  client_id INT REFERENCES clients(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  method VARCHAR(30),
  ref TEXT,
  paid_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- 🧩 ADD MISSING COLUMNS
-- ===========================

-- Invoices improvements
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0;

-- Products improvements
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Clients improvements
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Orders improvements
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Payments improvements
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

-- ===========================
-- ✅ Indexes for speed
-- ===========================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- ===========================
-- 🏁 Done
-- ===========================
