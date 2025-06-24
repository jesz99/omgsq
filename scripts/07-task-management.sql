-- Enhanced Task Management System with Subtasks and Attachments

-- Update existing tasks table with new fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_category ENUM('CASE', 'HARIAN') DEFAULT 'HARIAN';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_deadline DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress_percentage INT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT FALSE;

-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    assigned_to INT,
    due_date DATE,
    estimated_hours DECIMAL(5,2) DEFAULT 0,
    completed_hours DECIMAL(5,2) DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subtasks_task_id (task_id),
    INDEX idx_subtasks_assigned_to (assigned_to),
    INDEX idx_subtasks_status (status)
);

-- Create task attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    subtask_id INT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_attachments_task_id (task_id),
    INDEX idx_attachments_subtask_id (subtask_id)
);

-- Create task comments table for collaboration
CREATE TABLE IF NOT EXISTS task_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    subtask_id INT,
    comment TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comments_task_id (task_id),
    INDEX idx_comments_subtask_id (subtask_id)
);

-- Create task time tracking table
CREATE TABLE IF NOT EXISTS task_time_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    subtask_id INT,
    user_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_time_logs_task_id (task_id),
    INDEX idx_time_logs_user_id (user_id)
);

-- Insert sample enhanced tasks
INSERT INTO tasks (title, description, client_id, assigned_to, assigned_by, priority, status, category, due_date, estimated_hours, task_category, user_deadline, is_personal) VALUES
('Tax Return Preparation - ABC Corp', 'Complete annual tax return for ABC Corporation including all supporting documents', 1, 3, 1, 'High', 'In Progress', 'Tax Preparation', '2024-02-15', 8.0, 'CASE', '2024-02-10', FALSE),
('Daily Client Follow-ups', 'Daily routine to follow up with pending client queries and documentation', NULL, 3, 2, 'Medium', 'Pending', 'Client Management', '2024-01-25', 2.0, 'HARIAN', '2024-01-25', TRUE),
('Monthly Bookkeeping - XYZ Industries', 'Complete monthly bookkeeping and reconciliation for XYZ Industries', 2, 4, 1, 'High', 'Pending', 'Bookkeeping', '2024-02-01', 6.0, 'CASE', '2024-01-30', FALSE),
('Weekly Team Meeting Preparation', 'Prepare agenda and materials for weekly team meetings', NULL, 3, 2, 'Low', 'Scheduled', 'Meeting', '2024-01-26', 1.0, 'HARIAN', '2024-01-26', TRUE);

-- Insert sample subtasks
INSERT INTO subtasks (task_id, title, description, status, priority, assigned_to, due_date, estimated_hours, created_by) VALUES
(1, 'Gather Financial Documents', 'Collect all financial statements, receipts, and supporting documents', 'Completed', 'High', 3, '2024-01-20', 2.0, 1),
(1, 'Review Previous Year Returns', 'Analyze previous year tax returns for consistency', 'In Progress', 'Medium', 3, '2024-01-22', 1.5, 1),
(1, 'Calculate Tax Liability', 'Compute current year tax liability and deductions', 'Pending', 'High', 3, '2024-01-25', 3.0, 1),
(1, 'Prepare Final Return', 'Complete and review final tax return documents', 'Pending', 'Critical', 3, '2024-02-10', 2.0, 1),
(2, 'Morning Client Calls', 'Call clients with pending queries from previous day', 'Pending', 'Medium', 3, '2024-01-25', 1.0, 2),
(2, 'Email Follow-ups', 'Send follow-up emails for pending documentation', 'Pending', 'Low', 3, '2024-01-25', 0.5, 2),
(3, 'Bank Reconciliation', 'Reconcile all bank accounts for the month', 'Pending', 'High', 4, '2024-01-28', 3.0, 1),
(3, 'Expense Categorization', 'Categorize and verify all monthly expenses', 'Pending', 'Medium', 4, '2024-01-30', 2.0, 1);

-- Insert sample task comments
INSERT INTO task_comments (task_id, comment, created_by) VALUES
(1, 'Client has provided most documents. Still waiting for Q4 bank statements.', 3),
(1, 'Please prioritize this as client needs return filed by Feb 15th.', 1),
(3, 'Client mentioned some unusual transactions in December. Need to investigate.', 4);

-- Insert sample time logs
INSERT INTO task_time_logs (task_id, subtask_id, user_id, start_time, end_time, duration_minutes, description) VALUES
(1, 1, 3, '2024-01-20 09:00:00', '2024-01-20 11:30:00', 150, 'Collected and organized financial documents from client'),
(1, 2, 3, '2024-01-22 14:00:00', '2024-01-22 15:30:00', 90, 'Reviewed 2022 tax return for reference'),
(2, 5, 3, '2024-01-24 09:00:00', '2024-01-24 10:00:00', 60, 'Made follow-up calls to 5 clients');

-- Create views for reporting
CREATE OR REPLACE VIEW task_summary_view AS
SELECT 
    t.id,
    t.title,
    t.task_category,
    t.status,
    t.priority,
    t.due_date,
    t.user_deadline,
    t.estimated_hours,
    t.completed_hours,
    t.progress_percentage,
    t.is_personal,
    u.name as assigned_to_name,
    c.name as client_name,
    COUNT(st.id) as subtask_count,
    COUNT(CASE WHEN st.status = 'Completed' THEN 1 END) as completed_subtasks,
    COUNT(ta.id) as attachment_count,
    COALESCE(SUM(ttl.duration_minutes), 0) as total_time_minutes,
    t.created_at,
    t.updated_at
FROM tasks t
LEFT JOIN users u ON t.assigned_to = u.id
LEFT JOIN clients c ON t.client_id = c.id
LEFT JOIN subtasks st ON t.id = st.task_id
LEFT JOIN task_attachments ta ON t.id = ta.task_id
LEFT JOIN task_time_logs ttl ON t.id = ttl.task_id
GROUP BY t.id;

-- Create view for team performance
CREATE OR REPLACE VIEW team_task_performance AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'In Progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'Overdue' THEN 1 END) as overdue_tasks,
    COUNT(CASE WHEN t.task_category = 'CASE' THEN 1 END) as case_tasks,
    COUNT(CASE WHEN t.task_category = 'HARIAN' THEN 1 END) as daily_tasks,
    AVG(t.progress_percentage) as avg_progress,
    SUM(t.estimated_hours) as total_estimated_hours,
    SUM(t.completed_hours) as total_completed_hours,
    COALESCE(SUM(ttl.duration_minutes), 0) / 60 as total_logged_hours
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
LEFT JOIN task_time_logs ttl ON u.id = ttl.user_id
WHERE u.role IN ('team_member', 'team_leader')
GROUP BY u.id;
