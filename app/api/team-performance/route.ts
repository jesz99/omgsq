import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["team_leader", "director", "admin"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    let whereClause = ""
    let params: any[] = []

    // Filter based on user role
    if (decoded.role === "team_leader") {
      whereClause = "WHERE (u.team_leader_id = ? OR u.id = ?)"
      params = [decoded.id, decoded.id]
    }

    // Get team members with performance data
    const teamMembers = await query(
      `
      SELECT 
        u.id,
        u.name,
        u.role,
        tp.performance_score as performance,
        tp.efficiency_score as efficiency,
        tp.quality_score as quality,
        tp.client_satisfaction,
        tp.tasks_completed,
        tp.revenue_generated as revenue,
        us.skills
      FROM users u
      LEFT JOIN team_performance tp ON u.id = tp.user_id 
        AND tp.month_year = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
      LEFT JOIN (
        SELECT 
          user_id,
          GROUP_CONCAT(skill_name) as skills
        FROM user_skills
        GROUP BY user_id
      ) us ON u.id = us.user_id
      ${whereClause}
      AND u.role IN ('team_member', 'team_leader')
      ORDER BY tp.performance_score DESC
    `,
      params,
    )

    // Get performance trends (last 6 months)
    const performanceTrends = await query(
      `
      SELECT 
        DATE_FORMAT(tp.month_year, '%b') as month,
        u.name,
        tp.performance_score as performance
      FROM team_performance tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.month_year >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
      ${whereClause ? "AND (u.team_leader_id = ? OR u.id = ?)" : ""}
      ORDER BY tp.month_year, u.name
    `,
      decoded.role === "team_leader" ? [decoded.id, decoded.id] : [],
    )

    // Get skills data
    const skillsData = await query(
      `
      SELECT 
        us.skill_name as skill,
        u.name,
        CASE us.proficiency_level
          WHEN 'Beginner' THEN 25
          WHEN 'Intermediate' THEN 50
          WHEN 'Advanced' THEN 75
          WHEN 'Expert' THEN 100
        END as proficiency
      FROM user_skills us
      JOIN users u ON us.user_id = u.id
      ${whereClause ? "WHERE (u.team_leader_id = ? OR u.id = ?)" : ""}
      ORDER BY us.skill_name, u.name
    `,
      decoded.role === "team_leader" ? [decoded.id, decoded.id] : [],
    )

    return NextResponse.json({
      success: true,
      teamMembers: teamMembers.rows,
      performanceTrends: performanceTrends.rows,
      skillsData: skillsData.rows,
    })
  } catch (error) {
    console.error("Get team performance error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
