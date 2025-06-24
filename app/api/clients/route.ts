import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

// Get clients (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let queryText = `
      SELECT 
        c.*, 
        u.name as assigned_to_name,
        COUNT(i.id) as invoice_count,
        COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN 1 ELSE 0 END), 0) as overdue_count
      FROM clients c
      LEFT JOIN users u ON c.assigned_to = u.id
      LEFT JOIN invoices i ON c.id = i.client_id
    `
    let params: any[] = []

    // Filter based on user role
    if (decoded.role === "team_member") {
      queryText += " WHERE c.assigned_to = $1"
      params = [decoded.id]
    } else if (decoded.role === "team_leader") {
      queryText += " WHERE c.assigned_to IN (SELECT id FROM users WHERE team_leader_id = $1 OR id = $1)"
      params = [decoded.id]
    }

    queryText += " GROUP BY c.id, u.name ORDER BY c.created_at DESC"

    const result = await query(queryText, params)

    return NextResponse.json({ success: true, clients: result.rows })
  } catch (error) {
    console.error("Get clients error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new client
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["admin", "team_member", "team_leader"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { name, pic_name, pic_phone, address, tax_id, category, recurring_due_date, notes, tags, assigned_to } =
      await request.json()

    if (!name || !pic_name || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // If team member, assign to themselves
    const assignedTo = decoded.role === "team_member" ? decoded.id : assigned_to

    const result = await query(
      `
      INSERT INTO clients (
        name, pic_name, pic_phone, address, tax_id, category, 
        recurring_due_date, notes, tags, assigned_to
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
      [name, pic_name, pic_phone, address, tax_id, category, recurring_due_date, notes, tags, assignedTo],
    )

    const newClient = result.rows[0]

    // Create audit log
    await createAuditLog(decoded.id, "CREATE", "clients", newClient.id, null, newClient, request.ip)

    return NextResponse.json({ success: true, client: newClient })
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
