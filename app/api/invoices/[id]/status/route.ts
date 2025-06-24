import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded || !["finance", "admin", "director"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { status } = await request.json()

    if (!status || !["draft", "sent", "paid", "overdue", "done"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    // Get current invoice
    const currentResult = await query("SELECT * FROM invoices WHERE id = $1", [params.id])
    if (currentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
    }

    const currentInvoice = currentResult.rows[0]

    // Update invoice status
    let updateQuery = "UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP"
    const updateParams = [status, params.id]

    // Set additional timestamps based on status
    if (status === "sent" && currentInvoice.status === "draft") {
      updateQuery += ", sent_at = CURRENT_TIMESTAMP"
    } else if (status === "paid" && currentInvoice.status !== "paid") {
      updateQuery += ", paid_at = CURRENT_TIMESTAMP"
    }

    updateQuery += " WHERE id = $2 RETURNING *"

    const result = await query(updateQuery, updateParams)
    const updatedInvoice = result.rows[0]

    // Create audit log
    await createAuditLog(
      decoded.id,
      "UPDATE",
      "invoices",
      params.id,
      { status: currentInvoice.status },
      { status: status },
      request.ip,
    )

    return NextResponse.json({ success: true, invoice: updatedInvoice })
  } catch (error) {
    console.error("Update invoice status error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
