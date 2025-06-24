import { type NextRequest, NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

// Generate next invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await query("SELECT COUNT(*) as count FROM invoices WHERE invoice_number LIKE $1", [`INV-${year}-%`])
  const count = Number.parseInt(result.rows[0].count) + 1
  return `INV-${year}-${String(count).padStart(3, "0")}`
}

// Get invoices (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let queryText = `
      SELECT 
        i.*,
        c.name as client_name,
        c.pic_name as client_pic_name,
        ba.name as bank_account_name,
        u.name as created_by_name,
        uc.name as client_assigned_to_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN users uc ON c.assigned_to = uc.id
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

    queryText += " ORDER BY i.created_at DESC"

    const result = await query(queryText, params)

    return NextResponse.json({ success: true, invoices: result.rows })
  } catch (error) {
    console.error("Get invoices error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new invoice
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["finance", "admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { client_id, period, amount, due_date, bank_account_id, notes } = await request.json()

    if (!client_id || !amount || !due_date) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = await transaction(async (client) => {
      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber()

      // Create invoice
      const invoiceResult = await client.query(
        `
        INSERT INTO invoices (
          invoice_number, client_id, period, amount, due_date, 
          bank_account_id, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
        [invoiceNumber, client_id, period, amount, due_date, bank_account_id, notes, decoded.id],
      )

      return invoiceResult.rows[0]
    })

    // Create audit log
    await createAuditLog(decoded.id, "CREATE", "invoices", result.id, null, result, request.ip)

    return NextResponse.json({ success: true, invoice: result })
  } catch (error) {
    console.error("Create invoice error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
