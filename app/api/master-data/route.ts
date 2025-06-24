import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type) {
      // Get specific master data type
      const result = await getMasterDataByType(type)
      return NextResponse.json({ success: true, data: result })
    }

    // Get all master data
    const [
      paymentMethods,
      taskCategories,
      priorities,
      clientCategories,
      invoiceStatuses,
      taskStatuses,
      userRoles,
      bankAccounts,
      clients,
    ] = await Promise.all([
      query("SELECT * FROM master_payment_methods WHERE is_active = TRUE ORDER BY name"),
      query("SELECT * FROM master_task_categories WHERE is_active = TRUE ORDER BY name"),
      query("SELECT * FROM master_priorities WHERE is_active = TRUE ORDER BY level"),
      query("SELECT * FROM master_client_categories WHERE is_active = TRUE ORDER BY name"),
      query("SELECT * FROM master_invoice_statuses WHERE is_active = TRUE ORDER BY name"),
      query("SELECT * FROM master_task_statuses WHERE is_active = TRUE ORDER BY name"),
      query("SELECT * FROM master_user_roles WHERE is_active = TRUE ORDER BY name"),
      query("SELECT * FROM bank_accounts ORDER BY name"),
      query("SELECT id, name FROM clients ORDER BY name"),
    ])

    return NextResponse.json({
      success: true,
      data: {
        paymentMethods: paymentMethods.rows,
        taskCategories: taskCategories.rows,
        priorities: priorities.rows,
        clientCategories: clientCategories.rows,
        invoiceStatuses: invoiceStatuses.rows,
        taskStatuses: taskStatuses.rows,
        userRoles: userRoles.rows,
        bankAccounts: bankAccounts.rows,
        clients: clients.rows,
      },
    })
  } catch (error) {
    console.error("Master data fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch master data" }, { status: 500 })
  }
}

async function getMasterDataByType(type: string) {
  const queries = {
    "payment-methods": "SELECT * FROM master_payment_methods WHERE is_active = TRUE ORDER BY name",
    "task-categories": "SELECT * FROM master_task_categories WHERE is_active = TRUE ORDER BY name",
    priorities: "SELECT * FROM master_priorities WHERE is_active = TRUE ORDER BY level",
    "client-categories": "SELECT * FROM master_client_categories WHERE is_active = TRUE ORDER BY name",
    "invoice-statuses": "SELECT * FROM master_invoice_statuses WHERE is_active = TRUE ORDER BY name",
    "task-statuses": "SELECT * FROM master_task_statuses WHERE is_active = TRUE ORDER BY name",
    "user-roles": "SELECT * FROM master_user_roles WHERE is_active = TRUE ORDER BY name",
    "bank-accounts": "SELECT * FROM bank_accounts ORDER BY name",
    clients: "SELECT id, name FROM clients ORDER BY name",
  }

  const queryString = queries[type as keyof typeof queries]
  if (!queryString) {
    throw new Error(`Invalid master data type: ${type}`)
  }

  const result = await query(queryString)
  return result.rows
}
