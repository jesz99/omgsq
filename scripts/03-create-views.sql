-- Use the database
USE omgs_invoice_tracking;

-- View for invoice summary with client and user details
CREATE OR REPLACE VIEW invoice_summary AS
SELECT 
    i.id,
    i.invoice_number,
    i.amount,
    i.due_date,
    i.status,
    i.period,
    i.created_at,
    i.sent_at,
    i.paid_at,
    c.name as client_name,
    c.pic_name as client_pic_name,
    c.category as client_category,
    ba.name as bank_account_name,
    creator.name as created_by_name,
    assignee.name as assigned_to_name,
    assignee.role as assigned_to_role,
    tl.name as team_leader_name,
    -- Calculate days overdue
    CASE 
        WHEN i.status = 'overdue' AND i.due_date < CURDATE() 
        THEN DATEDIFF(CURDATE(), i.due_date)
        ELSE 0 
    END as days_overdue
FROM invoices i
JOIN clients c ON i.client_id = c.id
LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
LEFT JOIN users creator ON i.created_by = creator.id
LEFT JOIN users assignee ON c.assigned_to = assignee.id
LEFT JOIN users tl ON assignee.team_leader_id = tl.id;

-- View for team performance metrics
CREATE OR REPLACE VIEW team_performance AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    u.status,
    tl.name as team_leader_name,
    COUNT(DISTINCT c.id) as total_clients,
    COUNT(DISTINCT i.id) as total_invoices,
    COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) as paid_invoices,
    COUNT(DISTINCT CASE WHEN i.status = 'overdue' THEN i.id END) as overdue_invoices,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as total_revenue,
    CASE 
        WHEN COUNT(DISTINCT i.id) = 0 THEN 0
        ELSE ROUND((COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) * 100.0 / COUNT(DISTINCT i.id)), 2)
    END as completion_rate
FROM users u
LEFT JOIN clients c ON c.assigned_to = u.id
LEFT JOIN invoices i ON i.client_id = c.id
LEFT JOIN users tl ON u.team_leader_id = tl.id
WHERE u.role IN ('team_member', 'team_leader')
GROUP BY u.id, u.name, u.role, u.status, tl.name;

-- View for monthly revenue trends
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
    DATE_FORMAT(COALESCE(i.paid_at, i.created_at), '%Y-%m-01') as month,
    COUNT(DISTINCT i.id) as total_invoices,
    COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) as paid_invoices,
    COUNT(DISTINCT CASE WHEN i.status = 'overdue' THEN i.id END) as overdue_invoices,
    COALESCE(SUM(i.amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.amount ELSE 0 END), 0) as unpaid_amount
FROM invoices i
WHERE i.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
GROUP BY DATE_FORMAT(COALESCE(i.paid_at, i.created_at), '%Y-%m-01')
ORDER BY month DESC;

-- View for client summary with invoice statistics
CREATE OR REPLACE VIEW client_summary AS
SELECT 
    c.*,
    u.name as assigned_to_name,
    tl.name as team_leader_name,
    COUNT(DISTINCT i.id) as total_invoices,
    COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) as paid_invoices,
    COUNT(DISTINCT CASE WHEN i.status = 'overdue' THEN i.id END) as overdue_invoices,
    COALESCE(SUM(i.amount), 0) as total_invoice_amount,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.amount ELSE 0 END), 0) as outstanding_amount,
    MAX(i.created_at) as last_invoice_date
FROM clients c
LEFT JOIN users u ON c.assigned_to = u.id
LEFT JOIN users tl ON u.team_leader_id = tl.id
LEFT JOIN invoices i ON i.client_id = c.id
GROUP BY c.id, u.name, tl.name;
