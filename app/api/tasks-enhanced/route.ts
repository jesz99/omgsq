import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

// Get all tasks with enhanced details
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const includeSubtasks = url.searchParams.get("include_subtasks") === "true"
    const includeAttachments = url.searchParams.get("include_attachments") === "true"

    // Base query for tasks
    let tasksQuery = `
      SELECT 
        t.*,
        c.name as client_name,
        u.name as assigned_to_name,
        (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id AND status = 'Completed') as completed_subtasks,
        (SELECT COUNT(*) FROM task_attachments WHERE task_id = t.id) as attachment_count
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
    `

    // Filter based on user role
    if (!["admin", "director"].includes(decoded.role)) {
      tasksQuery += ` WHERE t.assigned_to = ? OR t.assigned_by = ?`
    }

    const params = !["admin", "director"].includes(decoded.role) ? [decoded.id, decoded.id] : []
    const tasksResult = await query(tasksQuery, params)

    let tasks = tasksResult.rows

    // Include subtasks if requested
    if (includeSubtasks && tasks.length > 0) {
      const taskIds = tasks.map((t: any) => t.id)
      const subtasksQuery = `
        SELECT st.*, u.name as assigned_to_name 
        FROM subtasks st 
        LEFT JOIN users u ON st.assigned_to = u.id 
        WHERE st.task_id IN (${taskIds.map(() => "?").join(",")})
        ORDER BY st.created_at ASC
      `
      const subtasksResult = await query(subtasksQuery, taskIds)

      // Group subtasks by task_id
      const subtasksByTask = subtasksResult.rows.reduce((acc: any, subtask: any) => {
        if (!acc[subtask.task_id]) acc[subtask.task_id] = []
        acc[subtask.task_id].push(subtask)
        return acc
      }, {})

      tasks = tasks.map((task: any) => ({
        ...task,
        subtasks: subtasksByTask[task.id] || [],
      }))
    }

    // Include attachments if requested
    if (includeAttachments && tasks.length > 0) {
      const taskIds = tasks.map((t: any) => t.id)
      const attachmentsQuery = `
        SELECT * FROM task_attachments 
        WHERE task_id IN (${taskIds.map(() => "?").join(",")})
      `
      const attachmentsResult = await query(attachmentsQuery, taskIds)

      // Group attachments by task_id
      const attachmentsByTask = attachmentsResult.rows.reduce((acc: any, attachment: any) => {
        if (!acc[attachment.task_id]) acc[attachment.task_id] = []
        acc[attachment.task_id].push(attachment)
        return acc
      }, {})

      tasks = tasks.map((task: any) => ({
        ...task,
        attachments: attachmentsByTask[task.id] || [],
      }))
    }

    return NextResponse.json({ success: true, tasks })
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

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!["team_member", "team_leader", "admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const {
      title,
      description,
      task_category,
      priority,
      client_id,
      due_date,
      user_deadline,
      estimated_hours,
      is_personal,
      subtasks = [],
    } = await request.json()

    if (!title || !task_category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate task_category
    if (!["CASE", "HARIAN"].includes(task_category)) {
      return NextResponse.json({ success: false, error: "Invalid task category" }, { status: 400 })
    }

    // Insert main task
    const taskResult = await query(
      `INSERT INTO tasks (
        title, description, task_category, priority, client_id, 
        due_date, user_deadline, estimated_hours, is_personal, 
        assigned_to, assigned_by, status, progress_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 0)`,
      [
        title,
        description || null,
        task_category,
        priority || "Medium",
        client_id || null,
        due_date || null,
        user_deadline || null,
        estimated_hours || 1,
        is_personal || false,
        decoded.id,
        decoded.id,
      ],
    )

    const taskId = taskResult.insertId

    // Create subtasks if provided
    if (subtasks && subtasks.length > 0) {
      for (const subtask of subtasks) {
        if (subtask.title) {
          await query(
            `INSERT INTO subtasks (
              task_id, title, description, priority, due_date, 
              estimated_hours, assigned_to, created_by, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [
              taskId,
              subtask.title,
              subtask.description || null,
              subtask.priority || "Medium",
              subtask.due_date || null,
              Number.parseFloat(subtask.estimated_hours) || 1,
              decoded.id,
              decoded.id,
            ],
          )
        }
      }
    }

    // Fetch the complete task with all details
    const newTaskResult = await query(
      `SELECT 
        t.*,
        c.name as client_name,
        u.name as assigned_to_name,
        (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id AND status = 'Completed') as completed_subtasks,
        (SELECT COUNT(*) FROM task_attachments WHERE task_id = t.id) as attachment_count
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?`,
      [taskId],
    )

    // Get subtasks for the new task
    const subtasksResult = await query(
      `SELECT st.*, u.name as assigned_to_name 
       FROM subtasks st 
       LEFT JOIN users u ON st.assigned_to = u.id 
       WHERE st.task_id = ?
       ORDER BY st.created_at ASC`,
      [taskId],
    )

    const taskWithDetails = {
      ...newTaskResult.rows[0],
      subtasks: subtasksResult.rows,
    }

    return NextResponse.json({ success: true, task: taskWithDetails })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
