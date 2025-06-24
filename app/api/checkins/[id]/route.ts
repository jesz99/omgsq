import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const checkinId = params.id
    const body = await request.json()

    // Check if check-in exists and user has permission
    const existingResult = await query("SELECT user_id FROM daily_checkins WHERE id = ?", [checkinId])

    if (!existingResult.rows || (existingResult.rows as any[]).length === 0) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 })
    }

    const checkin = (existingResult.rows as any[])[0]

    // Only the owner can update their check-in
    if (checkin.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const {
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

    await query(
      `
      UPDATE daily_checkins SET
        start_time = ?, end_time = ?, status = ?, mood = ?,
        productivity_level = ?, tasks_planned = ?, tasks_completed = ?,
        challenges_faced = ?, support_needed = ?, notes = ?,
        location = ?, total_hours = ?, break_hours = ?, overtime_hours = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
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
        checkinId,
      ],
    )

    return NextResponse.json({ message: "Check-in updated successfully" })
  } catch (error) {
    console.error("Error updating check-in:", error)
    return NextResponse.json({ error: "Failed to update check-in" }, { status: 500 })
  }
}
