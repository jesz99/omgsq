export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let stats: any = {}

    // Get role-specific statistics
    switch (decoded.role) {
      case "admin":
        const adminStats = await query(`
          SELECT 
            (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
            (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
            (SELECT COUNT(*) FROM bank_accounts WHERE is_active = true) as bank_accounts,
            100 as system_health
        `)
        stats = adminStats.rows[0]
        break

      case "finance":
        const financeStats = await query(`
          SELECT 
            (SELECT COUNT(*) FROM invoices) as total_invoices,
            (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status != 'paid') as unpaid_amount,
            (SELECT COUNT(*) FROM invoices WHERE status = 'overdue') as overdue_count,
            (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'paid' 
             AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)) as paid_this_month
        `)
        stats = financeStats.rows[0]
        break

      case "director":
        const directorStats = await query(`
          SELECT 
            (SELECT COUNT(*) FROM invoices) as total_invoices,
            (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'paid' 
             AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue,
            (SELECT COUNT(*) FROM invoices WHERE status != 'paid') as unpaid_invoices,
            (SELECT COUNT(*) FROM clients WHERE status = 'active') as active_clients
        `)
        stats = directorStats.rows[0]
        break

      case "team_member":
        const memberStats = await query(
          `
          SELECT 
            (SELECT COUNT(*) FROM clients WHERE assigned_to = ?) as my_clients,
            (SELECT COUNT(*) FROM invoices i JOIN clients c ON i.client_id = c.id 
             WHERE c.assigned_to = ? AND i.status = 'draft') as active_tasks,
            (SELECT COUNT(*) FROM invoices i JOIN clients c ON i.client_id = c.id 
             WHERE c.assigned_to = ? AND i.status = 'paid' 
             AND DATE_TRUNC('month', i.paid_at) = DATE_TRUNC('month', CURRENT_DATE)) as completed,
            (SELECT COUNT(*) FROM invoices i JOIN clients c ON i.client_id = c.id 
             WHERE c.assigned_to = ? AND i.status = 'sent') as pending_review
        `,
          [decoded.id],
        )
        stats = memberStats.rows[0]
        break

      case "team_leader":
        const leaderStats = await query(
          `
          SELECT 
            (SELECT COUNT(*) FROM users WHERE team_leader_id = ?) as team_members,
            (SELECT ROUND(AVG(completion_rate), 0) FROM (
              SELECT 
                u.id,
                CASE 
                  WHEN COUNT(i.id) = 0 THEN 0
                  ELSE (COUNT(CASE WHEN i.status = 'paid' THEN 1 END) * 100.0 / COUNT(i.id))
                END as completion_rate
              FROM users u
              LEFT JOIN clients c ON c.assigned_to = u.id
              LEFT JOIN invoices i ON i.client_id = c.id
              WHERE u.team_leader_id = ? OR u.id = ?
              GROUP BY u.id
            ) sub) as team_performance,
            (SELECT COUNT(*) FROM clients c JOIN users u ON c.assigned_to = u.id 
             WHERE u.team_leader_id = ? OR u.id = ?) as active_clients,
            (SELECT COUNT(*) FROM invoices i JOIN clients c ON i.client_id = c.id 
             JOIN users u ON c.assigned_to = u.id 
             WHERE (u.team_leader_id = ? OR u.id = ?) AND i.status = 'overdue') as overdue_tasks
        `,
          [decoded.id],
        )
        stats = leaderStats.rows[0]
        break
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
