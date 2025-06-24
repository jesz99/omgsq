import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

// Get payments
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["finance", "admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const result = await query(`
      SELECT 
        p.*,
        i.invoice_number,
        i.amount as invoice_amount,
        c.name as client_name,
        u.name as recorded_by_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN clients c ON i.client_id = c.id
      JOIN users u ON p.recorded_by = u.id
      ORDER BY p.created_at DESC
    `)

    return NextResponse.json({ success: true, payments: result.rows })
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new payment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["finance", "admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { invoice_id, payment_method, amount, payment_date, reference_number, notes } = await request.json()

    if (!invoice_id || !amount || !payment_date || !payment_method) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO payments (invoice_id, payment_method, amount, payment_date, reference_number, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [invoice_id, payment_method, amount, payment_date, reference_number, notes, decoded.id],
    )

    // Update invoice status to paid if full payment
    const invoice = await query("SELECT amount FROM invoices WHERE id = ?", [invoice_id])
    if (invoice.rows.length > 0 && Number(amount) >= Number(invoice.rows[0].amount)) {
      await query("UPDATE invoices SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?", [invoice_id])
    }

    const newPayment = await query(
      `
      SELECT 
        p.*,
        i.invoice_number,
        i.amount as invoice_amount,
        c.name as client_name,
        u.name as recorded_by_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN clients c ON i.client_id = c.id
      JOIN users u ON p.recorded_by = u.id
      WHERE p.id = ?
    `,
      [result.insertId],
    )

    // Create audit log
    await createAuditLog(decoded.id, "CREATE", "payments", result.insertId, null, newPayment.rows[0], request.ip)

    return NextResponse.json({ success: true, payment: newPayment.rows[0] })
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
