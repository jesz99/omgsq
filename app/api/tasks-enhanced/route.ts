import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

// Get enhanced tasks with subtasks and attachments
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeSubtasks = searchParams.get("include_subtasks") === "true"
    const includeAttachments = searchParams.get("include_attachments") === "true"
    const category = searchParams.get("category")

    let queryText = `
      SELECT 
        t.*,
        c.name as client_name,
        ua.name as assigned_by_name,
        uat.name as assigned_to_name,
        COUNT(st.id) as subtask_count,
        COUNT(CASE WHEN st.status = 'Completed' THEN 1 END) as completed_subtasks,
        COUNT(ta.id) as attachment_count,
        COALESCE(SUM(ttl.duration_minutes), 0) as total_time_minutes
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users ua ON t.assigned_by = ua.id
      LEFT JOIN users uat ON t.assigned_to = uat.id
      LEFT JOIN subtasks st ON t.id = st.task_id
      LEFT JOIN task_attachments ta ON t.id = ta.task_id
      LEFT JOIN task_time_logs ttl ON t.id = ttl.task_id
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

    // Add category filter
    if (category && ["CASE", "HARIAN"].includes(category)) {
      if (params.length > 0) {
        queryText += " AND t.task_category = ?"
      } else {
        queryText += " WHERE t.task_category = ?"
      }
      params.push(category)
    }

    queryText += " GROUP BY t.id ORDER BY t.created_at DESC"

    const result = await query(queryText, params)
    const tasks = result.rows

    // Get subtasks if requested
    if (includeSubtasks && tasks.length > 0) {
      const taskIds = tasks.map((t) => t.id)
      const subtasksResult = await query(
        `SELECT st.*, u.name as assigned_to_name 
         FROM subtasks st 
         LEFT JOIN users u ON st.assigned_to = u.id 
         WHERE st.task_id IN (${taskIds.map(() => "?").join(",")})
         ORDER BY st.created_at ASC`,
        taskIds,
      )

      // Group subtasks by task_id
      const subtasksByTask = subtasksResult.rows.reduce((acc, subtask) => {
        if (!acc[subtask.task_id]) acc[subtask.task_id] = []
        acc[subtask.task_id].push(subtask)
        return acc
      }, {})

      tasks.forEach((task) => {
        task.subtasks = subtasksByTask[task.id] || []
      })
    }

    // Get attachments if requested
    if (includeAttachments && tasks.length > 0) {
      const taskIds = tasks.map((t) => t.id)
      const attachmentsResult = await query(
        `SELECT ta.*, u.name as uploaded_by_name 
         FROM task_attachments ta 
         LEFT JOIN users u ON ta.uploaded_by = u.id 
         WHERE ta.task_id IN (${taskIds.map(() => "?").join(",")})
         ORDER BY ta.uploaded_at DESC`,
        taskIds,
      )

      // Group attachments by task_id
      const attachmentsByTask = attachmentsResult.rows.reduce((acc, attachment) => {
        if (!acc[attachment.task_id]) acc[attachment.task_id] = []
        acc[attachment.task_id].push(attachment)
        return acc
      }, {})

      tasks.forEach((task) => {
        task.attachments = attachmentsByTask[task.id] || []
      })
    }

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error("Get enhanced tasks error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new enhanced task
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["team_member", "team_leader", "director", "admin"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const {
      title,
      description,
      client_id,
      assigned_to,
      priority,
      category,
      due_date,
      user_deadline,
      estimated_hours,
      task_category,
      is_personal,
      subtasks,
    } = await request.json()

    if (!title || !priority || !task_category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create main task
    const taskResult = await query(
      `INSERT INTO tasks (title, description, client_id, assigned_to, assigned_by, priority, category, due_date, user_deadline, estimated_hours, task_category, is_personal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        client_id,
        assigned_to || decoded.id,
        decoded.id,
        priority,
        category,
        due_date,
        user_deadline,
        estimated_hours || 1,
        task_category,
        is_personal || false,
      ],
    )

    const taskId = taskResult.insertId

    // Create subtasks if provided
    if (subtasks && subtasks.length > 0) {
      for (const subtask of subtasks) {
        await query(
          `INSERT INTO subtasks (task_id, title, description, priority, due_date, estimated_hours, assigned_to, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            taskId,
            subtask.title,
            subtask.description || "",
            subtask.priority || "Medium",
            subtask.due_date,
            subtask.estimated_hours || 1,
            subtask.assigned_to || assigned_to || decoded.id,
            decoded.id,
          ],
        )
      }
    }

    // Get the created task with details
    const newTask = await query(
      `SELECT t.*, c.name as client_name, ua.name as assigned_by_name, uat.name as assigned_to_name
       FROM tasks t
       LEFT JOIN clients c ON t.client_id = c.id
       LEFT JOIN users ua ON t.assigned_by = ua.id
       LEFT JOIN users uat ON t.assigned_to = uat.id
       WHERE t.id = ?`,
      [taskId],
    )

    // Create audit log
    await createAuditLog(decoded.id, "CREATE", "tasks", taskId, null, newTask.rows[0], request.ip)

    return NextResponse.json({ success: true, task: newTask.rows[0] })
  } catch (error) {
    console.error("Create enhanced task error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
