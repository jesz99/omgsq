import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let sql = `
      SELECT 
        dc.*,
        u.name as user_name,
        u.role as user_role
      FROM daily_checkins dc
      JOIN users u ON dc.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    // Role-based access control
    if (user.role === "Team Member") {
      sql += " AND dc.user_id = ?"
      params.push(user.id)
    } else if (user.role === "Team Leader") {
      // Team leaders can see their own and their team members' check-ins
      sql += " AND (dc.user_id = ? OR u.role = 'Team Member')"
      params.push(user.id)
    }
    // Admin and Director can see all check-ins

    if (date) {
      sql += " AND dc.checkin_date = ?"
      params.push(date)
    }

    if (userId && (user.role === "Admin" || user.role === "Director")) {
      sql += " AND dc.user_id = ?"
      params.push(userId)
    }

    if (startDate && endDate) {
      sql += " AND dc.checkin_date BETWEEN ? AND ?"
      params.push(startDate, endDate)
    }

    sql += " ORDER BY dc.checkin_date DESC, dc.created_at DESC"

    const result = await query(sql, params)
    return NextResponse.json({ checkins: result.rows })
  } catch (error) {
    console.error("Error fetching check-ins:", error)
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only team members and team leaders can create check-ins
    if (!["Team Member", "Team Leader"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const {
      checkin_date,
      start_time,
      end_time,
      status,
      mood,
      productivity_level,
      tasks_planned,
      tasks_completed,
      challenges_faced,
      support_needed,
      notes,
      location,
      total_hours,
      break_hours,
      overtime_hours,
    } = body

    // Check if check-in already exists for today
    const existingResult = await query("SELECT id FROM daily_checkins WHERE user_id = ? AND checkin_date = ?", [
      user.id,
      checkin_date,
    ])

    if (existingResult.rows && (existingResult.rows as any[]).length > 0) {
      return NextResponse.json({ error: "Check-in already exists for this date" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO daily_checkins (
        user_id, checkin_date, start_time, end_time, status, mood, 
        productivity_level, tasks_planned, tasks_completed, challenges_faced, 
        support_needed, notes, location, total_hours, break_hours, overtime_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        user.id,
        checkin_date,
        start_time,
        end_time,
        status,
        mood,
        productivity_level,
        tasks_planned,
        tasks_completed,
        challenges_faced,
        support_needed,
        notes,
        location,
        total_hours,
        break_hours,
        overtime_hours,
      ],
    )

    return NextResponse.json({
      message: "Check-in created successfully",
      id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error creating check-in:", error)
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
  }
}
