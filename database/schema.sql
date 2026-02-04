-- POS System Database Schema
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos_db;

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    barcode VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100),
    tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_barcode (barcode),
    INDEX idx_category (category),
    INDEX idx_active (active)
) ENGINE=InnoDB;

-- =====================================================
-- LOYALTY PROGRAMS TABLE (BOGO)
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('BOGO', 'DISCOUNT', 'POINTS') NOT NULL DEFAULT 'BOGO',
    buy_quantity INT NOT NULL DEFAULT 1,
    free_quantity INT NOT NULL DEFAULT 1,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    product_barcode VARCHAR(50),
    category VARCHAR(100),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_active_dates (active, start_date, end_date),
    INDEX idx_product_barcode (product_barcode),
    INDEX idx_category (category),
    
    FOREIGN KEY (product_barcode) REFERENCES products(barcode) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- PROMOTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS promotions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL DEFAULT 'PERCENTAGE',
    discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    min_purchase DECIMAL(10, 2) DEFAULT 0.00,
    max_discount DECIMAL(10, 2) DEFAULT NULL,
    product_barcode VARCHAR(50),
    category VARCHAR(100),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_discount_type (discount_type),
    INDEX idx_active_dates (active, start_date, end_date),
    INDEX idx_product_barcode (product_barcode),
    INDEX idx_category (category),
    
    FOREIGN KEY (product_barcode) REFERENCES products(barcode) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- POS SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pos_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cashier_name VARCHAR(255) NOT NULL,
    opening_cash DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    closing_cash DECIMAL(10, 2) DEFAULT NULL,
    total_sales DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    transaction_count INT NOT NULL DEFAULT 0,
    status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    notes TEXT,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    
    INDEX idx_cashier (cashier_name),
    INDEX idx_status (status),
    INDEX idx_opened_at (opened_at)
) ENGINE=InnoDB;

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    session_id BIGINT NOT NULL,
    cashier_name VARCHAR(255) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_method ENUM('CASH', 'CARD', 'OTHER') NOT NULL DEFAULT 'CASH',
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order_number (order_number),
    INDEX idx_session_id (session_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_payment_method (payment_method),
    
    FOREIGN KEY (session_id) REFERENCES pos_sessions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_barcode VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    free_items INT NOT NULL DEFAULT 0,
    promotion_applied VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_product_barcode (product_barcode),
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample products
INSERT INTO products (barcode, name, description, price, stock, category, tax_rate) VALUES
('1001', 'Espresso', 'Single shot espresso', 2.50, 100, 'Beverages', 0.0800),
('1002', 'Americano', 'Espresso with hot water', 3.00, 100, 'Beverages', 0.0800),
('1003', 'Latte', 'Espresso with steamed milk', 4.00, 100, 'Beverages', 0.0800),
('1004', 'Cappuccino', 'Espresso with foam milk', 4.00, 100, 'Beverages', 0.0800),
('1005', 'Mocha', 'Espresso with chocolate and milk', 4.50, 100, 'Beverages', 0.0800),
('2001', 'Croissant', 'Butter croissant', 2.50, 50, 'Bakery', 0.0800),
('2002', 'Chocolate Muffin', 'Fresh baked muffin', 3.00, 50, 'Bakery', 0.0800),
('2003', 'Blueberry Scone', 'Fresh blueberry scone', 3.50, 50, 'Bakery', 0.0800),
('2004', 'Cinnamon Roll', 'Warm cinnamon roll', 4.00, 50, 'Bakery', 0.0800),
('3001', 'Ham Sandwich', 'Ham and cheese sandwich', 6.50, 30, 'Food', 0.0800),
('3002', 'Turkey Wrap', 'Turkey and veggie wrap', 7.00, 30, 'Food', 0.0800),
('3003', 'Caesar Salad', 'Fresh caesar salad', 8.00, 20, 'Food', 0.0800);

-- Insert sample loyalty programs
INSERT INTO loyalty_programs (name, type, buy_quantity, free_quantity, discount_percent, product_barcode, category, start_date, end_date) VALUES
('Buy 2 Get 1 Free Coffee', 'BOGO', 2, 1, 0, NULL, 'Beverages', '2024-01-01 00:00:00', '2025-12-31 23:59:59'),
('Buy 3 Get 1 Free Bakery', 'BOGO', 3, 1, 0, NULL, 'Bakery', '2024-01-01 00:00:00', '2025-12-31 23:59:59');

-- Insert sample promotions
INSERT INTO promotions (name, description, discount_type, discount_value, product_barcode, category, start_date, end_date) VALUES
('10% Off Food', '10% discount on all food items', 'PERCENTAGE', 10.00, NULL, 'Food', '2024-01-01 00:00:00', '2025-12-31 23:59:59'),
('$0.50 Off Croissant', 'Special discount on croissants', 'FIXED_AMOUNT', 0.50, '2001', NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59');

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- View: Daily Sales Summary
CREATE OR REPLACE VIEW v_daily_sales AS
SELECT 
    DATE(o.created_at) AS sale_date,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(o.subtotal) AS gross_sales,
    SUM(o.discount_amount) AS total_discounts,
    SUM(o.tax_amount) AS total_tax,
    SUM(o.total_amount) AS net_sales,
    SUM(CASE WHEN o.payment_method = 'CASH' THEN o.total_amount ELSE 0 END) AS cash_sales,
    SUM(CASE WHEN o.payment_method = 'CARD' THEN o.total_amount ELSE 0 END) AS card_sales
FROM orders o
WHERE o.status = 'COMPLETED'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- View: Product Sales Summary
CREATE OR REPLACE VIEW v_product_sales AS
SELECT 
    p.barcode,
    p.name AS product_name,
    p.category,
    COUNT(oi.id) AS times_sold,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.subtotal) AS gross_revenue,
    SUM(oi.discount_amount) AS total_discounts,
    SUM(oi.total_amount) AS net_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'COMPLETED'
GROUP BY p.id, p.barcode, p.name, p.category
ORDER BY total_quantity_sold DESC;

-- View: Active Promotions
CREATE OR REPLACE VIEW v_active_promotions AS
SELECT 
    id,
    name,
    discount_type,
    discount_value,
    product_barcode,
    category,
    start_date,
    end_date
FROM promotions
WHERE active = TRUE 
    AND NOW() BETWEEN start_date AND end_date;

-- View: Active Loyalty Programs
CREATE OR REPLACE VIEW v_active_loyalty AS
SELECT 
    id,
    name,
    type,
    buy_quantity,
    free_quantity,
    discount_percent,
    product_barcode,
    category,
    start_date,
    end_date
FROM loyalty_programs
WHERE active = TRUE 
    AND NOW() BETWEEN start_date AND end_date;

-- View: Session Summary
CREATE OR REPLACE VIEW v_session_summary AS
SELECT 
    s.id AS session_id,
    s.cashier_name,
    s.status,
    s.opened_at,
    s.closed_at,
    s.opening_cash,
    s.closing_cash,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total_amount), 0) AS total_sales,
    COALESCE(SUM(CASE WHEN o.payment_method = 'CASH' THEN o.total_amount ELSE 0 END), 0) AS cash_total,
    COALESCE(SUM(CASE WHEN o.payment_method = 'CARD' THEN o.total_amount ELSE 0 END), 0) AS card_total
FROM pos_sessions s
LEFT JOIN orders o ON s.id = o.session_id AND o.status = 'COMPLETED'
GROUP BY s.id, s.cashier_name, s.status, s.opened_at, s.closed_at, s.opening_cash, s.closing_cash
ORDER BY s.opened_at DESC;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure: Close Session
CREATE PROCEDURE sp_close_session(
    IN p_session_id BIGINT,
    IN p_closing_cash DECIMAL(10,2),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_total_sales DECIMAL(12,2);
    DECLARE v_transaction_count INT;
    
    -- Calculate totals
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*)
    INTO v_total_sales, v_transaction_count
    FROM orders 
    WHERE session_id = p_session_id AND status = 'COMPLETED';
    
    -- Update session
    UPDATE pos_sessions
    SET 
        status = 'CLOSED',
        closing_cash = p_closing_cash,
        total_sales = v_total_sales,
        transaction_count = v_transaction_count,
        notes = p_notes,
        closed_at = NOW()
    WHERE id = p_session_id AND status = 'OPEN';
END //

-- Procedure: Generate Order Number
CREATE FUNCTION fn_generate_order_number()
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE order_num VARCHAR(50);
    SET order_num = CONCAT('ORD-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
    RETURN order_num;
END //

DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_orders_session_status ON orders(session_id, status);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
CREATE INDEX idx_products_category_active ON products(category, active);
