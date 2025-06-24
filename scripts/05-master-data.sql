-- Use the database
USE omgs_invoice_tracking;

-- Create master data tables
CREATE TABLE IF NOT EXISTS master_payment_methods (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_task_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_priorities (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE,
    level INT NOT NULL,
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_client_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    billing_frequency VARCHAR(50),
    default_due_day INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_invoice_statuses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_task_statuses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_user_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Payment Methods
INSERT INTO master_payment_methods (name, description) VALUES
('Bank Transfer', 'Electronic bank-to-bank transfer'),
('Check', 'Physical or electronic check payment'),
('Online Transfer', 'Online banking transfer'),
('Credit Card', 'Credit card payment'),
('Debit Card', 'Debit card payment'),
('Cash', 'Cash payment'),
('Wire Transfer', 'International wire transfer'),
('ACH Transfer', 'Automated Clearing House transfer'),
('PayPal', 'PayPal payment'),
('Stripe', 'Stripe payment gateway');

-- Insert Task Categories
INSERT INTO master_task_categories (name, description, icon, color) VALUES
('Client Management', 'Tasks related to client relationship management', 'User', 'blue'),
('Tax Preparation', 'Tax return preparation and filing', 'FileText', 'green'),
('Bookkeeping', 'Accounting and bookkeeping tasks', 'Calculator', 'purple'),
('Consultation', 'Client consultation and advisory services', 'MessageCircle', 'orange'),
('Compliance', 'Regulatory compliance and reporting', 'Shield', 'red'),
('Documentation', 'Document preparation and management', 'FileText', 'gray'),
('Meeting', 'Client meetings and internal meetings', 'Calendar', 'yellow'),
('Collections', 'Payment collection and follow-up', 'AlertTriangle', 'red'),
('Research', 'Tax law research and analysis', 'Search', 'indigo'),
('Training', 'Staff training and development', 'GraduationCap', 'teal');

-- Insert Priorities
INSERT INTO master_priorities (name, level, color) VALUES
('Critical', 1, 'red'),
('High', 2, 'orange'),
('Medium', 3, 'yellow'),
('Low', 4, 'green');

-- Insert Client Categories
INSERT INTO master_client_categories (name, billing_frequency, default_due_day, description) VALUES
('Monthly', 'monthly', 15, 'Monthly recurring clients with regular tax services'),
('Quarterly', 'quarterly', 30, 'Quarterly reporting clients'),
('Yearly', 'yearly', 31, 'Annual tax preparation clients'),
('As Per Case', 'as_needed', NULL, 'Project-based or consultation clients'),
('Bi-Annual', 'bi_annual', 15, 'Semi-annual reporting clients');

-- Insert Invoice Statuses
INSERT INTO master_invoice_statuses (name, description, color) VALUES
('Draft', 'Invoice is being prepared', 'gray'),
('Sent', 'Invoice has been sent to client', 'blue'),
('Viewed', 'Client has viewed the invoice', 'cyan'),
('Paid', 'Invoice has been paid', 'green'),
('Overdue', 'Invoice payment is overdue', 'red'),
('Cancelled', 'Invoice has been cancelled', 'gray'),
('Partial', 'Invoice has been partially paid', 'yellow'),
('Done', 'Invoice process is complete', 'purple');

-- Insert Task Statuses
INSERT INTO master_task_statuses (name, description, color) VALUES
('Pending', 'Task is waiting to be started', 'gray'),
('In Progress', 'Task is currently being worked on', 'blue'),
('Review', 'Task is under review', 'yellow'),
('Completed', 'Task has been completed', 'green'),
('On Hold', 'Task is temporarily paused', 'orange'),
('Cancelled', 'Task has been cancelled', 'red'),
('Scheduled', 'Task is scheduled for future', 'purple'),
('Overdue', 'Task is past its due date', 'red');

-- Insert User Roles
INSERT INTO master_user_roles (name, description, permissions) VALUES
('admin', 'System Administrator', '{"all": true}'),
('director', 'Company Director', '{"users": "all", "clients": "all", "invoices": "all", "reports": "all", "analytics": "all"}'),
('finance', 'Finance Manager', '{"invoices": "all", "payments": "all", "reports": "financial", "clients": "view"}'),
('team_leader', 'Team Leader', '{"team": "manage", "tasks": "all", "clients": "assigned", "invoices": "team"}'),
('team_member', 'Team Member', '{"tasks": "assigned", "clients": "assigned", "invoices": "view"}');

-- Create indexes for better performance
CREATE INDEX idx_payment_methods_active ON master_payment_methods(is_active);
CREATE INDEX idx_task_categories_active ON master_task_categories(is_active);
CREATE INDEX idx_priorities_level ON master_priorities(level);
CREATE INDEX idx_client_categories_active ON master_client_categories(is_active);
CREATE INDEX idx_invoice_statuses_active ON master_invoice_statuses(is_active);
CREATE INDEX idx_task_statuses_active ON master_task_statuses(is_active);
CREATE INDEX idx_user_roles_active ON master_user_roles(is_active);
