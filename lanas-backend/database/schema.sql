-- Esquema de base de datos para tienda de lanas

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10, 2) NOT NULL,
  weight_grams INTEGER,
  fiber_composition VARCHAR(200),
  needle_size VARCHAR(50),
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  coming_soon BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_main BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100) NOT NULL,
  color_hex VARCHAR(7),
  sku VARCHAR(100) UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  price_override NUMERIC(10, 2),
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total NUMERIC(10, 2) NOT NULL,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  variant_name VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO admin_users (name, email, password, role)
VALUES ('Admin', 'admin@lanas.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin')
ON CONFLICT DO NOTHING;
