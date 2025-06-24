-- Create database
CREATE DATABASE IF NOT EXISTS omgs_invoice_tracking 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE omgs_invoice_tracking;

-- Users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    role ENUM('admin', 'team_member', 'team_leader', 'finance', 'director') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    photo_url VARCHAR(500),
    join_date DATE DEFAULT (CURRENT_DATE),
    team_leader_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_team_leader (team_leader_id),
    FOREIGN KEY (team_leader_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bank accounts table
CREATE TABLE bank_accounts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    branch VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Agency settings table
CREATE TABLE agency_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    stamp_url VARCHAR(500),
    director_signature_url VARCHAR(500),
    company_name VARCHAR(255),
    company_address TEXT,
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    pic_name VARCHAR(255) NOT NULL,
    pic_phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    category ENUM('monthly', 'yearly', 'as_per_case') NOT NULL,
    recurring_due_date INT, -- Day of month for recurring payments
    notes TEXT,
    tags JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    assigned_to CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clients_assigned_to (assigned_to),
    INDEX idx_clients_category (category),
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE RESTRICT
);

-- Client files table
CREATE TABLE client_files (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    uploaded_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Invoices table
CREATE TABLE invoices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_id CHAR(36) NOT NULL,
    period VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'done') DEFAULT 'draft',
    bank_account_id CHAR(36),
    notes TEXT,
    payment_proof_url VARCHAR(500),
    created_by CHAR(36) NOT NULL,
    paid_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_invoices_client_id (client_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_due_date (due_date),
    INDEX idx_invoices_created_by (created_by),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Invoice attachments table
CREATE TABLE invoice_attachments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    uploaded_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Notifications table
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type ENUM('invoice_overdue', 'invoice_due', 'task_assigned', 'payment_received') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id CHAR(36), -- Can reference invoice_id, client_id, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit logs table
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id CHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
