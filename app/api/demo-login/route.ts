import { NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"

// Demo login endpoint that works without database
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("Demo login attempt:", { email, password })

    // Demo users for testing without database
    const demoUsers = {
      "admin@omgs.com": {
        id: "demo-admin-id",
        name: "Demo Admin",
        email: "admin@omgs.com",
        role: "admin" as const,
        status: "active" as const,
        join_date: "2024-01-01",
        phone: "+1234567890",
        address: "123 Admin St, City",
      },
      "finance@omgs.com": {
        id: "demo-finance-id",
        name: "Demo Finance",
        email: "finance@omgs.com",
        role: "finance" as const,
        status: "active" as const,
        join_date: "2024-01-01",
        phone: "+1234567891",
        address: "456 Finance Ave, City",
      },
      "director@omgs.com": {
        id: "demo-director-id",
        name: "Demo Director",
        email: "director@omgs.com",
        role: "director" as const,
        status: "active" as const,
        join_date: "2024-01-01",
        phone: "+1234567892",
        address: "789 Director Blvd, City",
      },
      "john.smith@omgs.com": {
        id: "demo-leader-id",
        name: "John Smith",
        email: "john.smith@omgs.com",
        role: "team_leader" as const,
        status: "active" as const,
        join_date: "2024-01-01",
        phone: "+1234567893",
        address: "321 Leader St, City",
      },
      "mike.wilson@omgs.com": {
        id: "demo-member-id",
        name: "Mike Wilson",
        email: "mike.wilson@omgs.com",
        role: "team_member" as const,
        status: "active" as const,
        join_date: "2024-01-01",
        phone: "+1234567894",
        address: "654 Member Ave, City",
      },
    }

    // Check if user exists and password is correct (demo password is "admin123")
    const user = demoUsers[email as keyof typeof demoUsers]

    if (!user || password !== "admin123") {
      console.log("Demo login failed: Invalid credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid demo credentials. Use admin123 as password.",
        },
        { status: 401 },
      )
    }

    console.log("Demo login successful for:", user.email)

    const token = generateToken(user)

    const response = NextResponse.json({
      success: true,
      user,
      message: "Demo login successful (no database required)",
    })

    // Set the auth cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Demo login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Demo login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
