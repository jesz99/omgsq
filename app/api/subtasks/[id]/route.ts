import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const subtaskId = params.id
    const updates = await request.json()

    // Get current subtask
    const currentSubtask = await query("SELECT * FROM subtasks WHERE id = ?", [subtaskId])
    if (currentSubtask.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Subtask not found" }, { status: 404 })
    }

    const subtask = currentSubtask.rows[0]

    // Check permissions
    if (decoded.role === "team_member" && subtask.assigned_to !== decoded.id) {
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
      "estimated_hours",
      "completed_hours",
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
    updateValues.push(subtaskId)

    await query(`UPDATE subtasks SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    // Get updated subtask
    const updatedSubtask = await query(
      `SELECT st.*, u.name as assigned_to_name 
       FROM subtasks st 
       LEFT JOIN users u ON st.assigned_to = u.id 
       WHERE st.id = ?`,
      [subtaskId],
    )

    return NextResponse.json({ success: true, subtask: updatedSubtask.rows[0] })
  } catch (error) {
    console.error("Update subtask error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const subtaskId = params.id

    // Get current subtask
    const currentSubtask = await query("SELECT * FROM subtasks WHERE id = ?", [subtaskId])
    if (currentSubtask.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Subtask not found" }, { status: 404 })
    }

    const subtask = currentSubtask.rows[0]

    // Check permissions
    if (decoded.role === "team_member" && subtask.assigned_to !== decoded.id && subtask.created_by !== decoded.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    await query("DELETE FROM subtasks WHERE id = ?", [subtaskId])

    return NextResponse.json({ success: true, message: "Subtask deleted successfully" })
  } catch (error) {
    console.error("Delete subtask error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
