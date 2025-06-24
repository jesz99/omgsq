import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { status, completed_hours } = await request.json()
    const taskId = params.id

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    // Get current task
    const currentTask = await query("SELECT * FROM tasks WHERE id = ?", [taskId])
    if (currentTask.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Check if user can update this task
    const task = currentTask.rows[0]
    if (decoded.role === "team_member" && task.assigned_to !== decoded.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Update task status and completed hours
    const updateHours = status === "Completed" ? task.estimated_hours : completed_hours || task.completed_hours

    await query("UPDATE tasks SET status = ?, completed_hours = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      status,
      updateHours,
      taskId,
    ])

    // Get updated task
    const updatedTask = await query(
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
      [taskId],
    )

    // Create audit log
    await createAuditLog(decoded.id, "UPDATE", "tasks", taskId, task, updatedTask.rows[0], request.ip)

    return NextResponse.json({ success: true, task: updatedTask.rows[0] })
  } catch (error) {
    console.error("Update task status error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
