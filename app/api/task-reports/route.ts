import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const category = searchParams.get("category")
    const userId = searchParams.get("user_id")

    // Task summary statistics
    let summaryQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'Overdue' THEN 1 END) as overdue_tasks,
        COUNT(CASE WHEN task_category = 'CASE' THEN 1 END) as case_tasks,
        COUNT(CASE WHEN task_category = 'HARIAN' THEN 1 END) as daily_tasks,
        AVG(progress_percentage) as avg_progress,
        SUM(estimated_hours) as total_estimated_hours,
        SUM(completed_hours) as total_completed_hours
      FROM tasks t
      WHERE 1=1
    `
    const summaryParams = []

    if (startDate && endDate) {
      summaryQuery += " AND DATE(t.created_at) BETWEEN ? AND ?"
      summaryParams.push(startDate, endDate)
    }

    if (category && ["CASE", "HARIAN"].includes(category)) {
      summaryQuery += " AND t.task_category = ?"
      summaryParams.push(category)
    }

    if (userId) {
      summaryQuery += " AND t.assigned_to = ?"
      summaryParams.push(userId)
    }

    const summaryResult = await query(summaryQuery, summaryParams)

    // Team performance data
    let performanceQuery = `
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
    `
    const performanceParams = []

    if (startDate && endDate) {
      performanceQuery += " AND (t.created_at IS NULL OR DATE(t.created_at) BETWEEN ? AND ?)"
      performanceParams.push(startDate, endDate)
    }

    if (category && ["CASE", "HARIAN"].includes(category)) {
      performanceQuery += " AND (t.task_category IS NULL OR t.task_category = ?)"
      performanceParams.push(category)
    }

    if (userId) {
      performanceQuery += " AND u.id = ?"
      performanceParams.push(userId)
    }

    performanceQuery += " GROUP BY u.id ORDER BY completed_tasks DESC"

    const performanceResult = await query(performanceQuery, performanceParams)

    // Task category distribution
    const categoryQuery = `
      SELECT 
        task_category,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        AVG(progress_percentage) as avg_progress
      FROM tasks 
      WHERE 1=1
      ${startDate && endDate ? "AND DATE(created_at) BETWEEN ? AND ?" : ""}
      ${userId ? "AND assigned_to = ?" : ""}
      GROUP BY task_category
    `
    const categoryParams = []
    if (startDate && endDate) {
      categoryParams.push(startDate, endDate)
    }
    if (userId) {
      categoryParams.push(userId)
    }

    const categoryResult = await query(categoryQuery, categoryParams)

    // Daily task completion trend (last 30 days)
    const trendQuery = `
      SELECT 
        DATE(updated_at) as date,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks,
        COUNT(*) as total_tasks
      FROM tasks 
      WHERE DATE(updated_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ${userId ? "AND assigned_to = ?" : ""}
      GROUP BY DATE(updated_at)
      ORDER BY date DESC
      LIMIT 30
    `
    const trendParams = userId ? [userId] : []
    const trendResult = await query(trendQuery, trendParams)

    // Recent tasks
    let recentQuery = `
      SELECT 
        t.id,
        t.title,
        t.task_category,
        t.status,
        t.priority,
        t.progress_percentage,
        t.created_at,
        t.updated_at,
        u.name as assigned_to_name,
        c.name as client_name,
        COUNT(st.id) as subtask_count,
        COUNT(CASE WHEN st.status = 'Completed' THEN 1 END) as completed_subtasks
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN subtasks st ON t.id = st.task_id
      WHERE 1=1
    `
    const recentParams = []

    if (startDate && endDate) {
      recentQuery += " AND DATE(t.created_at) BETWEEN ? AND ?"
      recentParams.push(startDate, endDate)
    }

    if (category && ["CASE", "HARIAN"].includes(category)) {
      recentQuery += " AND t.task_category = ?"
      recentParams.push(category)
    }

    if (userId) {
      recentQuery += " AND t.assigned_to = ?"
      recentParams.push(userId)
    }

    recentQuery += " GROUP BY t.id ORDER BY t.updated_at DESC LIMIT 20"

    const recentResult = await query(recentQuery, recentParams)

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryResult.rows[0],
        team_performance: performanceResult.rows,
        category_distribution: categoryResult.rows,
        completion_trend: trendResult.rows,
        recent_tasks: recentResult.rows,
      },
    })
  } catch (error) {
    console.error("Task reports error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
