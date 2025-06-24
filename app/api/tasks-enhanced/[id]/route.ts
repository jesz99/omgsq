import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id

    // Get task details
    const taskResult = await query(
      `SELECT t.*, c.name as client_name, ua.name as assigned_by_name, uat.name as assigned_to_name
       FROM tasks t
       LEFT JOIN clients c ON t.client_id = c.id
       LEFT JOIN users ua ON t.assigned_by = ua.id
       LEFT JOIN users uat ON t.assigned_to = uat.id
       WHERE t.id = ?`,
      [taskId],
    )

    if (taskResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    const task = taskResult.rows[0]

    // Check permissions
    if (decoded.role === "team_member" && task.assigned_to !== decoded.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Get subtasks
    const subtasksResult = await query(
      `SELECT st.*, u.name as assigned_to_name 
       FROM subtasks st 
       LEFT JOIN users u ON st.assigned_to = u.id 
       WHERE st.task_id = ?
       ORDER BY st.created_at ASC`,
      [taskId],
    )

    // Get attachments
    const attachmentsResult = await query(
      `SELECT ta.*, u.name as uploaded_by_name 
       FROM task_attachments ta 
       LEFT JOIN users u ON ta.uploaded_by = u.id 
       WHERE ta.task_id = ?
       ORDER BY ta.uploaded_at DESC`,
      [taskId],
    )

    // Get comments
    const commentsResult = await query(
      `SELECT tc.*, u.name as created_by_name 
       FROM task_comments tc 
       LEFT JOIN users u ON tc.created_by = u.id 
       WHERE tc.task_id = ?
       ORDER BY tc.created_at DESC`,
      [taskId],
    )

    // Get time logs
    const timeLogsResult = await query(
      `SELECT ttl.*, u.name as user_name 
       FROM task_time_logs ttl 
       LEFT JOIN users u ON ttl.user_id = u.id 
       WHERE ttl.task_id = ?
       ORDER BY ttl.start_time DESC`,
      [taskId],
    )

    task.subtasks = subtasksResult.rows
    task.attachments = attachmentsResult.rows
    task.comments = commentsResult.rows
    task.time_logs = timeLogsResult.rows

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error("Get task details error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id
    const updates = await request.json()

    // Get current task
    const currentTask = await query("SELECT * FROM tasks WHERE id = ?", [taskId])
    if (currentTask.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    const task = currentTask.rows[0]

    // Check permissions
    if (decoded.role === "team_member" && task.assigned_to !== decoded.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Build update query
    const updateFields = []
    const updateValues = []

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "due_date",
      "user_deadline",
      "estimated_hours",
      "completed_hours",
      "progress_percentage",
      "task_category",
    ]

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(updates[field])
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(taskId)

    await query(`UPDATE tasks SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    // Get updated task
    const updatedTask = await query(
      `SELECT t.*, c.name as client_name, ua.name as assigned_by_name, uat.name as assigned_to_name
       FROM tasks t
       LEFT JOIN clients c ON t.client_id = c.id
       LEFT JOIN users ua ON t.assigned_by = ua.id
       LEFT JOIN users uat ON t.assigned_to = uat.id
       WHERE t.id = ?`,
      [taskId],
    )

    // Create audit log
    await createAuditLog(decoded.id, "UPDATE", "tasks", taskId, task, updatedTask.rows[0], request.ip)

    return NextResponse.json({ success: true, task: updatedTask.rows[0] })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
