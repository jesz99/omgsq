import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

// Get tasks (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let queryText = `
      SELECT 
        t.*,
        c.name as client_name,
        ua.name as assigned_by_name,
        uat.name as assigned_to_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users ua ON t.assigned_by = ua.id
      LEFT JOIN users uat ON t.assigned_to = uat.id
    `
    let params: any[] = []

    // Filter based on user role
    if (decoded.role === "team_member") {
      queryText += " WHERE t.assigned_to = ?"
      params = [decoded.id]
    } else if (decoded.role === "team_leader") {
      queryText += " WHERE t.assigned_to IN (SELECT id FROM users WHERE team_leader_id = ? OR id = ?)"
      params = [decoded.id, decoded.id]
    }

    queryText += " ORDER BY t.created_at DESC"

    const result = await query(queryText, params)

    return NextResponse.json({ success: true, tasks: result.rows })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new task
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["team_leader", "director", "admin"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { title, description, client_id, assigned_to, priority, category, due_date, estimated_hours } =
      await request.json()

    if (!title || !assigned_to || !priority || !due_date) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO tasks (title, description, client_id, assigned_to, assigned_by, priority, category, due_date, estimated_hours)
      VALUES (?, ?, ?, ?, ?, ?, null, ?, ?)
    `,
      [title, description, client_id, assigned_to, decoded.id, priority, category, due_date, estimated_hours || 1],
    )

    const newTask = await query(
      `
      SELECT 
        t.*,
        c.name as client_name,
        ua.name as assigned_by_name,
        uat.name as assigned_to_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users ua ON t.assigned_by = ua.id
      LEFT JOIN users uat ON t.assigned_to = uat.id
      WHERE t.id = ?
    `,
      [result.insertId],
    )

    // Create audit log
    await createAuditLog(decoded.id, "CREATE", "tasks", result.insertId, null, newTask.rows[0], request.ip)

    return NextResponse.json({ success: true, task: newTask.rows[0] })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
