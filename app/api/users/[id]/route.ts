import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword, verifyToken, createAuditLog } from "@/lib/auth"

// Get single user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const result = await query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.status, u.phone, u.address, 
        u.photo_url, u.join_date, u.team_leader_id, u.created_at,
        tl.name as team_leader_name
      FROM users u
      LEFT JOIN users tl ON u.team_leader_id = tl.id
      WHERE u.id = ?`,
      [params.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: result.rows[0] })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { name, email, password, phone, address, role, team_leader_id, status } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get current user data for audit log
    const currentUserResult = await query("SELECT * FROM users WHERE id = ?", [params.id])
    if (currentUserResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    const currentUser = currentUserResult.rows[0]

    // Check if email already exists (excluding current user)
    const existingUser = await query("SELECT id FROM users WHERE email = ? AND id != ?", [email, params.id])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    // Prepare update query
    let updateQuery = `
      UPDATE users 
      SET name = ?, email = ?, phone = ?, address = ?, role = ?, team_leader_id = ?, status = ?
    `
    const updateParams = [name, email, phone || null, address || null, role, team_leader_id || null, status || "active"]

    // Add password update if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await hashPassword(password)
      updateQuery += ", password_hash = ?"
      updateParams.push(hashedPassword)
    }

    updateQuery += " WHERE id = ?"
    updateParams.push(params.id)

    // Update user
    await query(updateQuery, updateParams)

    // Get updated user data
    const updatedUserResult = await query(
      `SELECT id, name, email, role, status, phone, address, join_date, team_leader_id
       FROM users WHERE id = ?`,
      [params.id],
    )

    const updatedUser = updatedUserResult.rows[0]

    // Create audit log
    await createAuditLog(decoded.id, "UPDATE", "users", params.id, currentUser, updatedUser, request.ip)

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Delete user (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Get current user data for audit log
    const currentUserResult = await query("SELECT * FROM users WHERE id = ?", [params.id])
    if (currentUserResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    const currentUser = currentUserResult.rows[0]

    // Check if user is a team leader with active team members
    const teamMembersResult = await query(
      "SELECT COUNT(*) as count FROM users WHERE team_leader_id = ? AND status = 'active'",
      [params.id],
    )

    if (teamMembersResult.rows[0].count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot deactivate user who is managing active team members. Please reassign team members first.",
        },
        { status: 400 },
      )
    }

    // Soft delete by setting status to inactive
    await query("UPDATE users SET status = 'inactive' WHERE id = ?", [params.id])

    // Get updated user data
    const updatedUserResult = await query(
      `SELECT id, name, email, role, status, phone, address, join_date, team_leader_id
       FROM users WHERE id = ?`,
      [params.id],
    )

    const updatedUser = updatedUserResult.rows[0]

    // Create audit log
    await createAuditLog(decoded.id, "DELETE", "users", params.id, currentUser, updatedUser, request.ip)

    return NextResponse.json({ success: true, message: "User deactivated successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
