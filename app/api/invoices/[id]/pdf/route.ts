import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import jsPDF from "jspdf"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const invoiceId = params.id

    // Get invoice details with client and bank account info
    const invoiceResult = await query(
      `
      SELECT 
        i.*,
        c.name as client_name,
        c.pic_name as client_pic_name,
        c.address as client_address,
        ba.name as bank_account_name,
        ba.account_number,
        ba.bank_name,
        ba.account_holder_name,
        u.name as created_by_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `,
      [invoiceId],
    )

    if (invoiceResult.length === 0) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 })
    }

    const invoice = invoiceResult.rows[0];

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Company Header
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("TAX CONSULTANT SERVICES", pageWidth / 2, 30, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Professional Tax & Accounting Services", pageWidth / 2, 40, { align: "center" })
    doc.text("Phone: +1 (555) 123-4567 | Email: info@taxconsultant.com", pageWidth / 2, 50, { align: "center" })

    // Invoice Title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 20, 80)

    // Invoice Details Box
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(20, 90, 80, 40)

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Number:", 25, 100)
    doc.text("Invoice Date:", 25, 110)
    doc.text("Due Date:", 25, 120)

    doc.setFont("helvetica", "normal")
    doc.text(invoice.invoice_number, 65, 100)
    doc.text(new Date(invoice.created_at).toLocaleDateString(), 65, 110)
    doc.text(new Date(invoice.due_date).toLocaleDateString(), 65, 120)

    // Client Details Box
    doc.rect(110, 90, 80, 40)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 115, 100)
    doc.setFont("helvetica", "normal")
    doc.text(invoice.client_name, 115, 110)
    if (invoice.client_pic_name) {
      doc.text(`Attn: ${invoice.client_pic_name}`, 115, 120)
    }

    // Client Address (if available)
    if (invoice.client_address) {
      const addressLines = doc.splitTextToSize(invoice.client_address, 70)
      let yPos = 140
      addressLines.forEach((line: string) => {
        doc.text(line, 115, yPos)
        yPos += 8
      })
    }

    // Service Details Table
    const tableStartY = 160
    doc.setFont("helvetica", "bold")
    doc.setFillColor(240, 240, 240)
    doc.rect(20, tableStartY, 170, 15, "F")
    doc.text("Description", 25, tableStartY + 10)
    doc.text("Period", 100, tableStartY + 10)
    doc.text("Amount", 150, tableStartY + 10)

    // Service Row
    doc.setFont("helvetica", "normal")
    doc.text("Tax Consultation Services", 25, tableStartY + 25)
    doc.text(invoice.period || "N/A", 100, tableStartY + 25)
    doc.text(`$${Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, 150, tableStartY + 25)

    // Table borders
    doc.setLineWidth(0.5)
    doc.line(20, tableStartY, 190, tableStartY) // Top
    doc.line(20, tableStartY + 15, 190, tableStartY + 15) // Header bottom
    doc.line(20, tableStartY + 35, 190, tableStartY + 35) // Bottom
    doc.line(20, tableStartY, 20, tableStartY + 35) // Left
    doc.line(190, tableStartY, 190, tableStartY + 35) // Right
    doc.line(95, tableStartY, 95, tableStartY + 35) // Column 1
    doc.line(145, tableStartY, 145, tableStartY + 35) // Column 2

    // Total Section
    const totalY = tableStartY + 50
    doc.setFont("helvetica", "bold")
    doc.setFillColor(250, 250, 250)
    doc.rect(120, totalY, 70, 15, "F")
    doc.text("TOTAL AMOUNT:", 125, totalY + 10)
    doc.setFontSize(14)
    doc.text(`$${Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, 170, totalY + 10)

    // Payment Instructions
    if (invoice.bank_account_name) {
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Payment Instructions:", 20, totalY + 35)
      doc.setFont("helvetica", "normal")
      doc.text(`Bank: ${invoice.bank_name || "N/A"}`, 20, totalY + 45)
      doc.text(`Account Name: ${invoice.account_holder_name || "N/A"}`, 20, totalY + 55)
      doc.text(`Account Number: ${invoice.account_number || "N/A"}`, 20, totalY + 65)
    }

    // Notes
    if (invoice.notes) {
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 20, totalY + 85)
      doc.setFont("helvetica", "normal")
      const noteLines = doc.splitTextToSize(invoice.notes, 170)
      let noteY = totalY + 95
      noteLines.forEach((line: string) => {
        doc.text(line, 20, noteY)
        noteY += 8
      })
    }

    // Footer
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 30, { align: "center" })
    doc.text(
      "This invoice was generated electronically and is valid without signature.",
      pageWidth / 2,
      pageHeight - 20,
      {
        align: "center",
      },
    )

    // Status Watermark
    if (invoice.status === "Paid") {
      doc.setFontSize(50)
      doc.setTextColor(0, 150, 0)
      doc.setFont("helvetica", "bold")
      doc.text("PAID", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 })
    } else if (invoice.status === "Overdue") {
      doc.setFontSize(50)
      doc.setTextColor(200, 0, 0)
      doc.setFont("helvetica", "bold")
      doc.text("OVERDUE", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 })
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Generate PDF error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate PDF" }, { status: 500 })
  }
}
