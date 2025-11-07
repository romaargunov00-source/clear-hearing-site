-- Создаём таблицу категорий
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаём таблицу товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category_id INTEGER REFERENCES categories(id),
    is_service BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаём индексы для быстрого поиска
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_products_slug ON products(slug);

-- Добавляем начальные категории
INSERT INTO categories (name, slug, description) VALUES 
('Слуховые аппараты', 'hearing-aids', 'Современные слуховые аппараты для комфортной жизни'),
('Аксессуары', 'accessories', 'Аксессуары для слуховых аппаратов'),
('Услуги', 'services', 'Профессиональные услуги по настройке и обслуживанию')
ON CONFLICT (slug) DO NOTHING;