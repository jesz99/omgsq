import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken, createAuditLog } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

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
      LEFT JOIN invoices i ON i.client_id = c.id
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

    if (!decoded || !["admin", "team_member", "team_leader", "finance"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    console.log("Received client data:", body)

    const {
      name,
      pic_name,
      pic_phone,
      address,
      tax_id,
      category,
      recurring_due_date,
      notes,
      tags,
      assigned_to,
      files,
    } = body

    if (!name || !pic_name || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, pic_name, and category are required",
        },
        { status: 400 },
      )
    }

    // Generate UUID for the client
    const clientId = uuidv4()
    console.log("Generated client UUID:", clientId)

    // Handle assigned_to conversion
    let assignedToValue = null
    if (assigned_to && assigned_to !== "unassigned" && assigned_to !== "") {
      assignedToValue = Number.parseInt(assigned_to)
      if (isNaN(assignedToValue)) {
        assignedToValue = null
      }
    }

    // If team member, assign to themselves
    if (decoded.role === "team_member") {
      assignedToValue = decoded.id
    }

    console.log("Processed assigned_to:", assignedToValue)

    // Handle recurring_due_date
    let recurringDueDateValue = null
    if (recurring_due_date && recurring_due_date !== "") {
      recurringDueDateValue = recurring_due_date
    }

    const insertQuery = `
      INSERT INTO clients (
        id, name, pic_name, pic_phone, address, tax_id, category, 
        recurring_due_date, notes, tags, assigned_to, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `

    const insertParams = [
      clientId,
      name,
      pic_name,
      pic_phone || null,
      address || null,
      tax_id || null,
      category,
      recurringDueDateValue,
      notes || null,
      tags || null,
      assignedToValue,
    ]

    console.log("Insert query:", insertQuery)
    console.log("Insert params:", insertParams)

    const result = await query(insertQuery, insertParams)
    console.log("Insert result:", result)

    if (result.affectedRows === 0) {
      console.error("No rows affected during insert")
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create client - no rows affected",
        },
        { status: 500 },
      )
    }

    console.log("Client created successfully with UUID:", clientId)

    // Fetch the created client with assigned user name
    const fetchQuery = `
      SELECT 
        c.*, 
        u.name as assigned_to_name
      FROM clients c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = ?
    `

    const fetchResult = await query(fetchQuery, [clientId])
    console.log("Fetch result:", fetchResult)

    if (!fetchResult.rows || fetchResult.rows.length === 0) {
      console.error("Failed to fetch created client")
      return NextResponse.json(
        {
          success: false,
          error: "Client created but could not retrieve client data",
        },
        { status: 500 },
      )
    }

    const newClient = fetchResult.rows[0]
    console.log("Fetched new client:", newClient)

    // Create audit log
    try {
      await createAuditLog(decoded.id, "CREATE", "clients", clientId, null, newClient, request.ip)
    } catch (auditError) {
      console.error("Audit log error:", auditError)
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      success: true,
      client: newClient,
      message: "Client created successfully",
    })
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

// Update client
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("PUT request received for client update")
    console.log("Params:", params)

    const token = request.cookies.get("auth-token")?.value
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!["admin", "team_member", "team_leader"].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const clientId = params.id
    console.log("Updating client with ID:", clientId)

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 })
    }

    const requestBody = await request.json()
    console.log("Request body:", requestBody)

    const { name, pic_name, pic_phone, address, tax_id, category, recurring_due_date, notes, tags, assigned_to } =
      requestBody

    if (!name || !pic_name || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, pic_name, category",
        },
        { status: 400 },
      )
    }

    // Get current client data for audit log
    console.log("Fetching current client data for audit...")
    const currentResult = await query("SELECT * FROM clients WHERE id = ?", [clientId])
    console.log("Current client query result:", currentResult)

    // Handle both array and object result formats
    const currentRows = Array.isArray(currentResult) ? currentResult : currentResult.rows || []

    if (currentRows.length === 0) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    const currentClient = currentRows[0]
    console.log("Current client data:", currentClient)

    // Convert assigned_to to number if provided, otherwise null
    const assignedToValue = assigned_to && assigned_to !== "" ? Number.parseInt(assigned_to) : null
    console.log("Assigned to value:", assignedToValue)

    // Prepare update query
    const updateQuery = `
      UPDATE clients SET
        name = ?, 
        pic_name = ?, 
        pic_phone = ?, 
        address = ?, 
        tax_id = ?, 
        category = ?, 
        recurring_due_date = ?, 
        notes = ?, 
        tags = ?, 
        assigned_to = ?,
        updated_at = NOW()
      WHERE id = ?
    `

    const updateParams = [
      name,
      pic_name,
      pic_phone || null,
      address || null,
      tax_id || null,
      category,
      recurring_due_date || null,
      notes || null,
      tags || null,
      assignedToValue,
      clientId,
    ]

    console.log("Update query:", updateQuery)
    console.log("Update params:", updateParams)

    const updateResult = await query(updateQuery, updateParams)
    console.log("Update result:", updateResult)

    // Check if update was successful
    const affectedRows = updateResult.affectedRows || updateResult.changedRows || 0
    if (affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Client not found or no changes made",
        },
        { status: 404 },
      )
    }

    // Get updated client data
    console.log("Fetching updated client data...")
    const updatedResult = await query(
      `
      SELECT 
        c.*, 
        u.name as assigned_to_name
      FROM clients c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = ?
    `,
      [clientId],
    )

    console.log("Updated client query result:", updatedResult)

    // Handle both array and object result formats
    const updatedRows = Array.isArray(updatedResult) ? updatedResult : updatedResult.rows || []

    if (updatedRows.length === 0) {
      return NextResponse.json({ success: false, error: "Failed to fetch updated client" }, { status: 500 })
    }

    const updatedClient = updatedRows[0]
    console.log("Updated client data:", updatedClient)

    // Create audit log
    try {
      await createAuditLog(decoded.id, "UPDATE", "clients", clientId, currentClient, updatedClient, request.ip)
      console.log("Audit log created successfully")
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError)
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: "Client updated successfully",
    })
  } catch (error) {
    console.error("Update client error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error: " + error.message,
      },
      { status: 500 },
    )
  }
}