-- Use the database
USE omgs_invoice_tracking;

-- Insert admin user (password: admin123)
INSERT INTO users (id, name, email, password_hash, role, phone, address)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'System Admin', 'admin@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'admin', '+1234567890', '123 Admin St, City');

-- Insert team leaders
INSERT INTO users (id, name, email, password_hash, role, phone, address)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'team_leader', '+1234567891', '456 Leader Ave, City'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah.johnson@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'team_leader', '+1234567892', '789 Leader St, City');

-- Insert team members
INSERT INTO users (id, name, email, password_hash, role, phone, address, team_leader_id)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440003', 'Mike Wilson', 'mike.wilson@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'team_member', '+1234567893', '123 Member St, City', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Jane Doe', 'jane.doe@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'team_member', '+1234567894', '456 Member Ave, City', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Tom Brown', 'tom.brown@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'team_member', '+1234567895', '789 Member Rd, City', '550e8400-e29b-41d4-a716-446655440002');

-- Insert finance user
INSERT INTO users (id, name, email, password_hash, role, phone, address)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440006', 'Finance Manager', 'finance@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'finance', '+1234567896', '101 Finance St, City');

-- Insert director
INSERT INTO users (id, name, email, password_hash, role, phone, address)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440007', 'Director', 'director@omgs.com', '$2b$10$rOzJQQEJJqPK8tJKEjJ8MuQeX8vGfYzBxgNmNcRtK7ZJLzJ9YNqKe', 'director', '+1234567897', '200 Director Blvd, City');

-- Insert bank accounts
INSERT INTO bank_accounts (id, name, account_number, branch, currency)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440000', 'Primary Business Account', '1234567890', 'Main Branch', 'USD'),
    ('660e8400-e29b-41d4-a716-446655440001', 'Secondary Account', '0987654321', 'Downtown Branch', 'USD'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Tax Payment Account', '1122334455', 'Business Center', 'USD');

-- Insert agency settings
INSERT INTO agency_settings (id, company_name, company_address, tax_id)
VALUES 
    ('770e8400-e29b-41d4-a716-446655440000', 'OMGS Tax Consulting', '123 Business District, City, State 12345', 'TAX-OMGS-2024');

-- Insert sample clients
INSERT INTO clients (id, name, pic_name, pic_phone, address, tax_id, category, recurring_due_date, notes, assigned_to)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440000', 'ABC Corporation', 'Robert Johnson', '+1555000001', '123 Corporate Blvd, Business City', 'TAX-ABC-001', 'monthly', 15, 'Large corporate client', '550e8400-e29b-41d4-a716-446655440003'),
    ('880e8400-e29b-41d4-a716-446655440001', 'XYZ Industries', 'Maria Garcia', '+1555000002', '456 Industrial Ave, Manufacturing City', 'TAX-XYZ-002', 'yearly', 31, 'Annual tax preparation', '550e8400-e29b-41d4-a716-446655440004'),
    ('880e8400-e29b-41d4-a716-446655440002', 'Tech Solutions Ltd', 'David Kim', '+1555000003', '789 Tech Park Dr, Innovation City', 'TAX-TECH-003', 'as_per_case', NULL, 'Project-based consulting', '550e8400-e29b-41d4-a716-446655440005'),
    ('880e8400-e29b-41d4-a716-446655440003', 'Global Enterprises', 'Lisa Chen', '+1555000004', '321 Global Plaza, International City', 'TAX-GLOBAL-004', 'monthly', 1, 'Multi-location client', '550e8400-e29b-41d4-a716-446655440003'),
    ('880e8400-e29b-41d4-a716-446655440004', 'StartUp Inc', 'Alex Rodriguez', '+1555000005', '654 Startup St, Venture City', 'TAX-STARTUP-005', 'yearly', 15, 'Growing startup', '550e8400-e29b-41d4-a716-446655440004');

-- Insert sample invoices
INSERT INTO invoices (id, invoice_number, client_id, period, amount, due_date, status, bank_account_id, created_by)
VALUES 
    ('990e8400-e29b-41d4-a716-446655440000', 'INV-2024-001', '880e8400-e29b-41d4-a716-446655440000', 'January 2024', 2500.00, '2024-01-31', 'sent', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006'),
    ('990e8400-e29b-41d4-a716-446655440001', 'INV-2024-002', '880e8400-e29b-41d4-a716-446655440001', 'Q4 2023', 5000.00, '2024-02-15', 'draft', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006'),
    ('990e8400-e29b-41d4-a716-446655440002', 'INV-2024-003', '880e8400-e29b-41d4-a716-446655440002', 'December 2023', 1800.00, '2024-01-15', 'overdue', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006'),
    ('990e8400-e29b-41d4-a716-446655440003', 'INV-2024-004', '880e8400-e29b-41d4-a716-446655440003', 'January 2024', 3200.00, '2024-01-20', 'paid', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006'),
    ('990e8400-e29b-41d4-a716-446655440004', 'INV-2024-005', '880e8400-e29b-41d4-a716-446655440004', 'Q4 2023', 4100.00, '2024-02-01', 'sent', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, related_id)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440006', 'invoice_overdue', 'Invoice Overdue', 'Invoice INV-2024-003 for Tech Solutions Ltd is now overdue', '990e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440007', 'invoice_overdue', 'Overdue Invoice Alert', 'Invoice INV-2024-003 requires immediate attention', '990e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440003', 'task_assigned', 'New Client Assigned', 'You have been assigned a new client: ABC Corporation', '880e8400-e29b-41d4-a716-446655440000');
