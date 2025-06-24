import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword, verifyToken, createAuditLog } from "@/lib/auth"

// Get all users
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.phone, u.address, 
        u.photo_url, u.join_date, u.team_leader_id, u.created_at,
        tl.name as team_leader_name,
        (SELECT COUNT(*) FROM users WHERE team_leader_id = u.id) as team_members_count
      FROM users u
      LEFT JOIN users tl ON u.team_leader_id = tl.id
      ORDER BY u.created_at DESC
    `)

    return NextResponse.json({ success: true, users: result.rows })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { name, email, password, phone, address, role, team_leader_id } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    // Insert new user
    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, phone, address, role, team_leader_id, status, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [name, email, hashedPassword, phone || null, address || null, role, team_leader_id || null],
    )

    // Get the inserted user data
    const userId = insertResult.rows.insertId
    const userResult = await query(
      `SELECT id, name, email, role, status, phone, address, join_date, team_leader_id
       FROM users WHERE id = ?`,
      [userId],
    )

    const newUser = userResult.rows[0]

    // Create audit log
    await createAuditLog(decoded.id, "CREATE", "users", newUser.id, null, newUser, request.ip)

    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
