-- Daily Check-ins System

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    checkin_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status ENUM('Present', 'Late', 'Half Day', 'Work From Home', 'Sick Leave', 'Personal Leave') DEFAULT 'Present',
    mood ENUM('Excellent', 'Good', 'Average', 'Poor', 'Stressed') DEFAULT 'Good',
    productivity_level TINYINT DEFAULT 5 CHECK (productivity_level BETWEEN 1 AND 10),
    tasks_planned TEXT,
    tasks_completed TEXT,
    challenges_faced TEXT,
    support_needed TEXT,
    notes TEXT,
    location ENUM('Office', 'Home', 'Client Site', 'Other') DEFAULT 'Office',
    total_hours DECIMAL(4,2) DEFAULT 0,
    break_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, checkin_date),
    INDEX idx_checkin_date (checkin_date),
    INDEX idx_user_date (user_id, checkin_date)
);

-- Check-in templates for different roles
CREATE TABLE IF NOT EXISTS checkin_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    questions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample check-in data
INSERT INTO daily_checkins (user_id, checkin_date, start_time, end_time, status, mood, productivity_level, tasks_planned, tasks_completed, challenges_faced, support_needed, notes, location, total_hours, break_hours, overtime_hours) VALUES
-- Team Member (Sarah Johnson - user_id: 3)
(3, '2024-01-22', '09:00:00', '17:30:00', 'Present', 'Good', 8, 'Complete tax returns for 3 clients, Review documentation for ABC Corp', 'Completed 2 tax returns, Started ABC Corp review', 'Complex tax situation for one client', 'Need consultation with senior team member', 'Productive day overall', 'Office', 8.5, 1.0, 0.5),
(3, '2024-01-21', '09:15:00', '17:00:00', 'Late', 'Average', 7, 'Finish pending invoices, Client calls', 'Completed all invoices, Made 5 client calls', 'Traffic delay in morning', 'None', 'Caught up despite late start', 'Office', 7.75, 1.0, 0.0),
(3, '2024-01-20', '09:00:00', '13:00:00', 'Half Day', 'Good', 6, 'Process payments, Update client records', 'Processed 8 payments, Updated 12 client records', 'None', 'None', 'Half day for personal appointment', 'Office', 4.0, 0.5, 0.0),

-- Team Member (Mike Wilson - user_id: 4)
(4, '2024-01-22', '08:45:00', '17:15:00', 'Present', 'Excellent', 9, 'Audit preparation, Team meeting, Client consultation', 'Completed audit prep, Attended meeting, Successful client consultation', 'None', 'None', 'Very productive day', 'Office', 8.5, 1.0, 0.0),
(4, '2024-01-21', '10:00:00', '18:00:00', 'Work From Home', 'Good', 8, 'Document review, Email responses, Report preparation', 'Reviewed 15 documents, Responded to all emails, Completed monthly report', 'Internet connectivity issues', 'Better internet backup needed', 'Worked from home due to home repairs', 'Home', 8.0, 1.0, 0.0),

-- Team Member (Emily Davis - user_id: 5)
(5, '2024-01-22', '09:00:00', '17:00:00', 'Present', 'Good', 7, 'Data entry, Client support calls, Invoice processing', 'Completed data entry for 20 clients, Handled 12 support calls', 'Difficult client complaint', 'Training on complaint handling', 'Handled challenging situation well', 'Office', 8.0, 1.0, 0.0),
(5, '2024-01-21', '09:00:00', NULL, 'Sick Leave', 'Poor', 0, 'Scheduled: Client data updates', 'None - sick leave', 'Flu symptoms', 'Medical leave', 'Taking sick leave', 'Home', 0.0, 0.0, 0.0);

-- Insert check-in templates
INSERT INTO checkin_templates (role, template_name, questions, is_active) VALUES
('Team Member', 'Daily Check-in', JSON_ARRAY(
    'What tasks do you plan to complete today?',
    'Any challenges you anticipate?',
    'Do you need support from anyone?',
    'How is your workload today?'
), TRUE),
('Team Leader', 'Leadership Check-in', JSON_ARRAY(
    'What are your team priorities today?',
    'Any team members need support?',
    'Client escalations or issues?',
    'Resource requirements?',
    'Team performance observations?'
), TRUE);
