export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"
import { testConnection } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json(
        {
          success: false,
          error: "No authentication token",
        },
        { status: 401 },
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("Invalid token")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      )
    }

    console.log("Token decoded successfully:", { id: decoded.id, email: decoded.email, role: decoded.role })

    // Check if this is a demo user (starts with "demo-")
    if (decoded.id.startsWith("demo-")) {
      console.log("Demo user detected, returning demo user data")
      // Return demo user data directly from token
      const demoUser = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.id.includes("admin")
          ? "Demo Admin"
          : decoded.id.includes("finance")
            ? "Demo Finance"
            : decoded.id.includes("director")
              ? "Demo Director"
              : decoded.id.includes("leader")
                ? "John Smith"
                : "Mike Wilson",
        status: "active" as const,
        join_date: "2024-01-01",
        phone: "+1234567890",
        address: "Demo Address",
      }

      return NextResponse.json({ success: true, user: demoUser })
    }

    // For real users, check database connection first
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("Database connection failed in /auth/me")
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 },
      )
    }

    const user = await getUserById(decoded.id)
    if (!user) {
      console.log("User not found in database")
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
