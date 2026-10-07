ALTER TABLE users MODIFY COLUMN role ENUM('developer', 'admin', 'customer') NOT NULL DEFAULT 'customer';
