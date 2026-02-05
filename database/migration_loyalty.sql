-- =====================================================
-- MIGRATION: Upgrade loyalty_programs table
-- From old schema (BOGO/DISCOUNT/POINTS with product_barcode)
-- To new schema (type 0=DISCOUNT, 1=BUY_X_GET_Y with trigger/reward product lists)
-- =====================================================

USE pos_db;

-- Step 1: Add new columns if they don't exist
ALTER TABLE loyalty_programs
    ADD COLUMN IF NOT EXISTS trigger_product_ids VARCHAR(1000) COMMENT 'Comma-separated barcodes of trigger products',
    ADD COLUMN IF NOT EXISTS reward_product_ids VARCHAR(1000) COMMENT 'Comma-separated barcodes of reward products',
    ADD COLUMN IF NOT EXISTS min_quantity INT NOT NULL DEFAULT 1 COMMENT 'Min qty of trigger product to activate',
    ADD COLUMN IF NOT EXISTS reward_quantity INT NOT NULL DEFAULT 1 COMMENT 'Number of reward items per activation';

-- Step 2: Migrate existing data
-- For old BOGO type: product_barcode becomes both trigger and reward
UPDATE loyalty_programs
SET
    type = 1,
    trigger_product_ids = COALESCE(product_barcode, ''),
    reward_product_ids = COALESCE(product_barcode, ''),
    min_quantity = COALESCE(buy_quantity, 1),
    reward_quantity = COALESCE(free_quantity, 1)
WHERE type = 'BOGO' OR type = '1';

-- For old DISCOUNT type: product_barcode becomes both trigger and reward
UPDATE loyalty_programs
SET
    type = 0,
    trigger_product_ids = COALESCE(product_barcode, ''),
    reward_product_ids = COALESCE(product_barcode, ''),
    min_quantity = 1,
    reward_quantity = 1
WHERE type = 'DISCOUNT' OR type = '0' OR type = 'POINTS';

-- Step 3: Modify the type column to INT (if it was ENUM before)
-- Note: This may require dropping and recreating the column depending on MySQL version
-- ALTER TABLE loyalty_programs MODIFY COLUMN type INT NOT NULL DEFAULT 0;

-- Step 4: Drop old columns that are no longer needed (optional, keep for safety)
-- ALTER TABLE loyalty_programs DROP COLUMN IF EXISTS buy_quantity;
-- ALTER TABLE loyalty_programs DROP COLUMN IF EXISTS free_quantity;
-- ALTER TABLE loyalty_programs DROP COLUMN IF EXISTS product_barcode;
-- ALTER TABLE loyalty_programs DROP COLUMN IF EXISTS category;

-- Step 5: Update indexes
-- DROP INDEX IF EXISTS idx_type ON loyalty_programs;
-- DROP INDEX IF EXISTS idx_product_barcode ON loyalty_programs;
-- DROP INDEX IF EXISTS idx_category ON loyalty_programs;
-- CREATE INDEX idx_loyalty_type ON loyalty_programs(type);
-- CREATE INDEX idx_loyalty_active ON loyalty_programs(active);
-- CREATE INDEX idx_loyalty_dates ON loyalty_programs(active, start_date, end_date);

SELECT 'Migration complete. Please verify the data.' AS status;
SELECT id, name, type, trigger_product_ids, reward_product_ids, min_quantity, reward_quantity, discount_percent, active FROM loyalty_programs;
