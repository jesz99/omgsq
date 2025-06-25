import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// Get subtasks for a task
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const taskId = url.searchParams.get("task_id")

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 })
    }

    // Check if user has access to the parent task
    const taskCheck = await query("SELECT * FROM tasks WHERE id = ? AND (assigned_to = ? OR assigned_by = ?)", [
      taskId,
      decoded.id,
      decoded.id,
    ])

    if (taskCheck.rows.length === 0 && !["admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const result = await query(
      `SELECT st.*, u.name as assigned_to_name 
       FROM subtasks st 
       LEFT JOIN users u ON st.assigned_to = u.id 
       WHERE st.task_id = ?
       ORDER BY st.created_at ASC`,
      [taskId],
    )

    return NextResponse.json({ success: true, subtasks: result.rows })
  } catch (error) {
    console.error("Get subtasks error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new subtask
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { task_id, title, description, priority, due_date, estimated_hours, assigned_to } = await request.json()

    // Validate required fields
    if (!task_id || !title) {
      return NextResponse.json({ success: false, error: "Task ID and title are required" }, { status: 400 })
    }

    // Validate task_id is a number
    const taskIdNum = Number.parseInt(task_id)
    if (isNaN(taskIdNum)) {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    // Check if user has access to the parent task
    const taskCheck = await query("SELECT * FROM tasks WHERE id = ? AND (assigned_to = ? OR assigned_by = ?)", [
      taskIdNum,
      decoded.id,
      decoded.id,
    ])

    if (taskCheck.rows.length === 0 && !["admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized to add subtasks to this task" }, { status: 403 })
    }

    const result = await query(
      `INSERT INTO subtasks (task_id, title, description, priority, due_date, estimated_hours, assigned_to, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        taskIdNum,
        title,
        description || null,
        priority || "Medium",
        due_date || null,
        Number.parseFloat(estimated_hours) || 1,
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
