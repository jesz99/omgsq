import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["director", "admin"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Get all teams with their performance
    const teams = await query(`
      SELECT 
        CASE 
          WHEN tl.id = 1 THEN 'Team Alpha'
          WHEN tl.id = 2 THEN 'Team Beta'
          ELSE 'Team Gamma'
        END as name,
        tl.name as leader,
        COUNT(DISTINCT u.id) as members,
        AVG(tp.performance_score) as performance,
        SUM(tp.revenue_generated) as revenue,
        COUNT(DISTINCT c.id) as clients,
        AVG(tp.efficiency_score) as efficiency,
        AVG(tp.client_satisfaction) as satisfaction
      FROM users tl
      LEFT JOIN users u ON tl.id = u.team_leader_id
      LEFT JOIN team_performance tp ON u.id = tp.user_id 
        AND tp.month_year = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
      LEFT JOIN clients c ON u.id = c.assigned_to
      WHERE tl.role = 'team_leader'
      GROUP BY tl.id, tl.name
      ORDER BY AVG(tp.performance_score) DESC
    `)

    // Get all team members with their details
    const teamMembers = await query(`
      SELECT 
        u.id,
        u.name,
        u.role,
        CASE 
          WHEN u.team_leader_id = 1 THEN 'Team Alpha'
          WHEN u.team_leader_id = 2 THEN 'Team Beta'
          ELSE 'Team Gamma'
        END as team,
        tp.performance_score as performance,
        COUNT(DISTINCT c.id) as clients,
        tp.revenue_generated as revenue,
        CASE 
          WHEN u.status = 'active' THEN 'Active'
          ELSE 'Offline'
        END as status,
        'Recently' as lastActive
      FROM users u
      LEFT JOIN team_performance tp ON u.id = tp.user_id 
        AND tp.month_year = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
      LEFT JOIN clients c ON u.id = c.assigned_to
      WHERE u.role IN ('team_member', 'team_leader')
      GROUP BY u.id, u.name, u.role, u.team_leader_id, tp.performance_score, tp.revenue_generated, u.status
      ORDER BY tp.performance_score DESC
    `)

    // Get performance comparison data
    const performanceData = await query(`
      SELECT 
        CASE 
          WHEN tl.id = 1 THEN 'Team Alpha'
          WHEN tl.id = 2 THEN 'Team Beta'
          ELSE 'Team Gamma'
        END as team,
        AVG(tp.performance_score) as performance,
        AVG(tp.efficiency_score) as efficiency,
        SUM(tp.revenue_generated)/1000 as revenue
      FROM users tl
      LEFT JOIN users u ON tl.id = u.team_leader_id
      LEFT JOIN team_performance tp ON u.id = tp.user_id 
        AND tp.month_year = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
      WHERE tl.role = 'team_leader'
      GROUP BY tl.id
      ORDER BY tl.id
    `)

    return NextResponse.json({
      success: true,
      teams: teams.rows,
      teamMembers: teamMembers.rows,
      performanceData: performanceData.rows,
    })
  } catch (error) {
    console.error("Get team overview error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
