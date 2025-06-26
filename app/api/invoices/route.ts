import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

// Generate next invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const result = await query("SELECT COUNT(*) as count FROM invoices WHERE invoice_number LIKE ?", [`INV-${year}-%`])
  const count = Number.parseInt(result.rows[0]?.count || 0) + 1
  return `INV-${year}-${String(count).padStart(3, "0")}`
}

// Get invoices (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    console.log("=== GET INVOICES START ===")
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      console.log("No valid token found")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("User role:", decoded.role)

    let queryText = `
      SELECT 
        i.*,
        c.name as client_name,
        c.pic_name as client_pic_name,
        ba.name as bank_account_name,
        ba.account_number as bank_account_number,
        ba.bank_name as bank_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
    `
    let params: any[] = []

    // Filter based on user role
    if (decoded.role === "team_member") {
      queryText += " WHERE c.assigned_to = ?"
      params = [decoded.id]
    } else if (decoded.role === "team_leader") {
      queryText += " WHERE c.assigned_to IN (SELECT id FROM users WHERE team_leader_id = ? OR id = ?)"
      params = [decoded.id, decoded.id]
    }

    queryText += " ORDER BY i.created_at DESC"

    console.log("Executing query:", queryText)
    console.log("With params:", params)

    const result = await query(queryText, params)
    console.log("Query result:", result.rows?.length || 0, "invoices found")

    return NextResponse.json({ success: true, invoices: result.rows || [] })
  } catch (error) {
    console.error("Get invoices error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Create new invoice
export async function POST(request: NextRequest) {
  try {
    console.log("=== CREATE INVOICE START ===")
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      console.log("No valid token found")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!["finance", "admin", "director"].includes(decoded.role)) {
      console.log("Insufficient permissions for role:", decoded.role)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    console.log("Request body:", body)

    const {  invoice_number, client_id, period, amount, invoice_date, due_date, bank_account_id } = body

    // Validate required fields
    if (!client_id || !amount || !due_date || !invoice_date) {
      console.log("Missing required fields:", { client_id, amount, due_date })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: client_id, amount, and due_date are required",
        },
        { status: 400 },
      )
    }

    // Generate UUID and invoice number
    const invoiceId = uuidv4()
    //const invoiceNumber = await generateInvoiceNumber()

    console.log("Generated invoice ID:", invoiceId)
    

    // Insert invoice with MySQL syntax
    const insertResult = await query(
      `INSERT INTO invoices (
        id, invoice_number, client_id, period, amount, invoice_date, due_date, 
        bank_account_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
      [
        invoiceId,
        invoice_number,
        client_id,
        period || null,
        amount,
        invoice_date, 
        due_date,
        bank_account_id || null
      ],
    )

    console.log("Insert result:", insertResult)

    if (insertResult.affectedRows === 0) {
      console.log("No rows affected during insert")
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create invoice",
        },
        { status: 500 },
      )
    }

    // Fetch the created invoice with all related data
    const createdInvoice = await query(
      `SELECT 
        i.*,
        c.name as client_name,
        c.pic_name as client_pic_name,
        ba.name as bank_account_name,
        ba.account_number as bank_account_number,
        ba.bank_name as bank_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      WHERE i.id = ?`,
      [invoiceId],
    )

    if (!createdInvoice.rows || createdInvoice.rows.length === 0) {
      console.log("Failed to fetch created invoice")
      return NextResponse.json(
        {
          success: false,
          error: "Invoice created but failed to retrieve",
        },
        { status: 500 },
      )
    }

    const invoice = createdInvoice.rows[0]
    console.log("Created invoice:", invoice)

    // Create audit log
    try {
      await createAuditLog(decoded.id, "CREATE", "invoices", invoiceId, null, invoice, request.ip)
      console.log("Audit log created successfully")
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError)
      // Don't fail the request if audit logging fails
    }

    console.log("=== CREATE INVOICE SUCCESS ===")
    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error("Create invoice error:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error: " + error.message,
      },
      { status: 500 },
    )
  }
}
