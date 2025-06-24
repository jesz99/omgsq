import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin and Director can access reports
    if (!["Admin", "Director"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "summary"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let dateFilter = ""
    const params: any[] = []

    if (startDate && endDate) {
      dateFilter = "AND dc.checkin_date BETWEEN ? AND ?"
      params.push(startDate, endDate)
    } else {
      // Default to last 30 days
      dateFilter = "AND dc.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)"
    }

    if (reportType === "summary") {
      // Summary report
      const summaryResult = await query(
        `
        SELECT 
          COUNT(*) as total_checkins,
          COUNT(DISTINCT dc.user_id) as active_users,
          AVG(dc.productivity_level) as avg_productivity,
          COUNT(CASE WHEN dc.status = 'Present' THEN 1 END) as present_count,
          COUNT(CASE WHEN dc.status = 'Late' THEN 1 END) as late_count,
          COUNT(CASE WHEN dc.status = 'Work From Home' THEN 1 END) as wfh_count,
          COUNT(CASE WHEN dc.status IN ('Sick Leave', 'Personal Leave') THEN 1 END) as leave_count,
          AVG(dc.total_hours) as avg_hours,
          SUM(dc.overtime_hours) as total_overtime
        FROM daily_checkins dc
        WHERE 1=1 ${dateFilter}
      `,
        params,
      )

      // Mood distribution
      const moodResult = await query(
        `
        SELECT 
          dc.mood,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM daily_checkins WHERE 1=1 ${dateFilter}), 2) as percentage
        FROM daily_checkins dc
        WHERE 1=1 ${dateFilter}
        GROUP BY dc.mood
        ORDER BY count DESC
      `,
        params,
      )

      // Daily trends
      const trendsResult = await query(
        `
        SELECT 
          dc.checkin_date,
          COUNT(*) as checkins,
          AVG(dc.productivity_level) as avg_productivity,
          COUNT(CASE WHEN dc.status = 'Present' THEN 1 END) as present,
          COUNT(CASE WHEN dc.status = 'Late' THEN 1 END) as late
        FROM daily_checkins dc
        WHERE 1=1 ${dateFilter}
        GROUP BY dc.checkin_date
        ORDER BY dc.checkin_date DESC
        LIMIT 30
      `,
        params,
      )

      return NextResponse.json({
        summary: summaryResult.rows?.[0] || {},
        moodDistribution: moodResult.rows || [],
        dailyTrends: trendsResult.rows || [],
      })
    } else if (reportType === "detailed") {
      // Detailed user report
      const detailedResult = await query(
        `
        SELECT 
          u.id,
          u.name,
          u.role,
          COUNT(dc.id) as total_checkins,
          AVG(dc.productivity_level) as avg_productivity,
          AVG(dc.total_hours) as avg_hours,
          SUM(dc.overtime_hours) as total_overtime,
          COUNT(CASE WHEN dc.status = 'Present' THEN 1 END) as present_days,
          COUNT(CASE WHEN dc.status = 'Late' THEN 1 END) as late_days,
          COUNT(CASE WHEN dc.status IN ('Sick Leave', 'Personal Leave') THEN 1 END) as leave_days,
          MAX(dc.checkin_date) as last_checkin
        FROM users u
        LEFT JOIN daily_checkins dc ON u.id = dc.user_id ${dateFilter.replace("AND", "AND")}
        WHERE u.role IN ('Team Member', 'Team Leader')
        GROUP BY u.id, u.name, u.role
        ORDER BY u.name
      `,
        params,
      )

      return NextResponse.json({
        users: detailedResult.rows || [],
      })
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  } catch (error) {
    console.error("Error generating check-in reports:", error)
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 })
  }
}
