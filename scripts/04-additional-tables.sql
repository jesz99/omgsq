-- Additional tables for complete system functionality

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INT,
    assigned_to INT NOT NULL,
    assigned_by INT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Completed', 'Scheduled', 'Overdue') DEFAULT 'Pending',
    category VARCHAR(100),
    due_date DATE,
    estimated_hours DECIMAL(5,2) DEFAULT 0,
    completed_hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    payment_method ENUM('Bank Transfer', 'Check', 'Cash', 'Credit Card', 'Online') DEFAULT 'Bank Transfer',
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    status ENUM('Pending', 'Confirmed', 'Failed', 'Cancelled') DEFAULT 'Pending',
    recorded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Team performance metrics table
CREATE TABLE IF NOT EXISTS team_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month_year DATE NOT NULL,
    performance_score DECIMAL(5,2) DEFAULT 0,
    efficiency_score DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    client_satisfaction DECIMAL(3,2) DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_month (user_id, month_year)
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample tasks
INSERT INTO tasks (title, description, client_id, assigned_to, assigned_by, priority, status, category, due_date, estimated_hours, completed_hours) VALUES
('Update client profile - ABC Corporation', 'Review and update client information for quarterly review', 1, 3, 1, 'High', 'In Progress', 'Client Management', '2024-01-20', 2.0, 1.0),
('Prepare monthly tax report', 'Generate comprehensive tax report for December 2023', 2, 3, 2, 'Medium', 'Pending', 'Reporting', '2024-01-25', 4.0, 0.0),
('Review invoice documentation', 'Check all supporting documents for invoice INV-003', 3, 4, 1, 'Low', 'Completed', 'Documentation', '2024-01-18', 1.0, 1.0),
('Client consultation meeting', 'Quarterly business review with Global Enterprises', 4, 3, 2, 'High', 'Scheduled', 'Meeting', '2024-01-22', 3.0, 0.0),
('Follow up on overdue payment', 'Contact client regarding overdue invoice', 5, 4, 1, 'Critical', 'Overdue', 'Collections', '2024-01-15', 1.0, 0.0);

-- Insert sample payments
INSERT INTO payments (invoice_id, payment_method, amount, payment_date, reference_number, notes, status, recorded_by) VALUES
(1, 'Bank Transfer', 2500.00, '2024-01-15', 'TXN-001', 'Payment received on time', 'Confirmed', 2),
(2, 'Check', 1800.00, '2024-01-20', 'CHK-002', 'Check cleared successfully', 'Confirmed', 2),
(4, 'Online', 4100.00, '2024-01-18', 'ONL-003', 'Online payment processed', 'Confirmed', 2);

-- Insert sample team performance data
INSERT INTO team_performance (user_id, month_year, performance_score, efficiency_score, quality_score, client_satisfaction, tasks_completed, revenue_generated) VALUES
(3, '2024-01-01', 95.0, 92.0, 98.0, 4.8, 45, 18000.00),
(4, '2024-01-01', 89.0, 87.0, 94.0, 4.6, 38, 14500.00),
(5, '2024-01-01', 87.0, 85.0, 90.0, 4.4, 42, 12000.00);

-- Insert sample user skills
INSERT INTO user_skills (user_id, skill_name, proficiency_level) VALUES
(3, 'Tax Planning', 'Expert'),
(3, 'Corporate Tax', 'Advanced'),
(3, 'Audit', 'Advanced'),
(4, 'Individual Tax', 'Expert'),
(4, 'Bookkeeping', 'Advanced'),
(4, 'Payroll', 'Intermediate'),
(5, 'Basic Tax', 'Intermediate'),
(5, 'Data Entry', 'Advanced'),
(5, 'Client Support', 'Intermediate');
