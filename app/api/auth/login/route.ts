export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { testConnection } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // First check if database is available
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("Database connection failed in /auth/login")
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed. Please check your database configuration.",
        },
        { status: 500 },
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    const result = await authenticateUser(email, password)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    // Set HTTP-only cookie with the token
    const response = NextResponse.json(result)
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
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
