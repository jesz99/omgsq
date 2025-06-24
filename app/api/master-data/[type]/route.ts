import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { type } = params

    let sql = ""
    let tableName = ""

    // Map type to table name
    switch (type) {
      case "payment-methods":
        tableName = "master_payment_methods"
        break
      case "task-categories":
        tableName = "master_task_categories"
        break
      case "priorities":
        tableName = "master_priorities"
        break
      case "client-categories":
        tableName = "master_client_categories"
        break
      case "invoice-statuses":
        tableName = "master_invoice_statuses"
        break
      case "task-statuses":
        tableName = "master_task_statuses"
        break
      case "user-roles":
        tableName = "master_user_roles"
        break
      case "bank-accounts":
        tableName = "master_bank_accounts"
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid master data type" }, { status: 400 })
    }

    sql = `SELECT * FROM ${tableName} ORDER BY name`
    const result = await query(sql)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Master data fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch master data",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { type } = params
    const body = await request.json()

    let tableName = ""
    let fields = []
    let values = []
    let placeholders = []

    // Map type to table and fields
    switch (type) {
      case "payment-methods":
        tableName = "master_payment_methods"
        fields = ["name"]
        values = [body.name]
        placeholders = ["$1"]
        break
      case "task-categories":
        tableName = "master_task_categories"
        fields = ["name", "icon", "color"]
        values = [body.name, body.icon, body.color]
        placeholders = ["$1", "$2", "$3"]
        break
      case "priorities":
        tableName = "master_priorities"
        fields = ["name", "level", "color"]
        values = [body.name, body.level, body.color]
        placeholders = ["$1", "$2", "$3"]
        break
      case "bank-accounts":
        tableName = "master_bank_accounts"
        fields = ["name", "account_number"]
        values = [body.name, body.account_number]
        placeholders = ["$1", "$2"]
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid master data type" }, { status: 400 })
    }

    const sql = `
      INSERT INTO ${tableName} (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `

    const result = await query(sql, values)

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Master data creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create master data",
      },
      { status: 500 },
    )
  }
}
