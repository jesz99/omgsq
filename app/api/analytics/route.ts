import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["director", "admin", "finance"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Revenue analytics
    const revenueData = await query(`
      SELECT 
        DATE_FORMAT(paid_at, '%b') as month,
        SUM(amount) as revenue,
        COUNT(*) as invoice_count
      FROM invoices 
      WHERE status = 'paid' AND paid_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m'), DATE_FORMAT(paid_at, '%b')
      ORDER BY DATE_FORMAT(paid_at, '%Y-%m')
    `)

    // Team performance analytics
    const teamPerformance = await query(`
      SELECT 
        CASE 
          WHEN u.team_leader_id = 1 THEN 'Team Alpha'
          WHEN u.team_leader_id = 2 THEN 'Team Beta'
          ELSE 'Team Gamma'
        END as team,
        AVG(tp.performance_score) as performance,
        AVG(tp.efficiency_score) as efficiency,
        SUM(tp.revenue_generated) as revenue,
        COUNT(DISTINCT u.id) as members
      FROM team_performance tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.month_year >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
      GROUP BY u.team_leader_id
    `)

    // Client analytics
    const clientAnalytics = await query(`
      SELECT 
        c.service_type as category,
        COUNT(*) as client_count,
        AVG(CASE WHEN i.status = 'paid' THEN 1 ELSE 0 END) * 100 as retention_rate,
        SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as total_value
      FROM clients c
      LEFT JOIN invoices i ON c.id = i.client_id
      WHERE c.status = 'active'
      GROUP BY c.service_type
    `)

    // Invoice flow analytics
    const invoiceFlow = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM invoices)) as percentage
      FROM invoices
      GROUP BY status
      ORDER BY 
        CASE status
          WHEN 'draft' THEN 1
          WHEN 'sent' THEN 2
          WHEN 'paid' THEN 3
          WHEN 'overdue' THEN 4
          ELSE 5
        END
    `)

    // KPI data
    const kpiData = await query(`
      SELECT 
        'Task Completion' as name,
        AVG(CASE WHEN t.status = 'Completed' THEN 100 ELSE 0 END) as value,
        90 as target
      FROM tasks t
      UNION ALL
      SELECT 
        'Quality Score' as name,
        AVG(tp.quality_score) as value,
        95 as target
      FROM team_performance tp
      WHERE tp.month_year >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
      UNION ALL
      SELECT 
        'Client Satisfaction' as name,
        AVG(tp.client_satisfaction) as value,
        4.5 as target
      FROM team_performance tp
      WHERE tp.month_year >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
    `)

    return NextResponse.json({
      success: true,
      analytics: {
        revenue: revenueData.rows,
        teamPerformance: teamPerformance.rows,
        clientAnalytics: clientAnalytics.rows,
        invoiceFlow: invoiceFlow.rows,
        kpiData: kpiData.rows,
      },
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
