-- Test basic connection
SELECT 1 as connection_test, NOW() as current_time;

-- Check if database exists
SHOW DATABASES LIKE 'omgs_invoice_tracking';

-- If database exists, use it and check tables
USE omgs_invoice_tracking;
SHOW TABLES;

-- Check if users table exists and has data
SELECT COUNT(*) as user_count FROM users;
