import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// Create new subtask
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { task_id, title, description, priority, due_date, estimated_hours, assigned_to } = await request.json()

    if (!task_id || !title) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if user has access to the parent task
    const taskCheck = await query("SELECT * FROM tasks WHERE id = ? AND (assigned_to = ? OR assigned_by = ?)", [
      task_id,
      decoded.id,
      decoded.id,
    ])

    if (taskCheck.rows.length === 0 && !["admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const result = await query(
      `INSERT INTO subtasks (task_id, title, description, priority, due_date, estimated_hours, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task_id,
        title,
        description,
        priority || "Medium",
        due_date,
        estimated_hours || 1,
        assigned_to || decoded.id,
        decoded.id,
      ],
    )

    const newSubtask = await query(
      `SELECT st.*, u.name as assigned_to_name 
       FROM subtasks st 
       LEFT JOIN users u ON st.assigned_to = u.id 
       WHERE st.id = ?`,
      [result.insertId],
    )

    return NextResponse.json({ success: true, subtask: newSubtask.rows[0] })
  } catch (error) {
    console.error("Create subtask error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
