export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== API Test Route Called ===")

    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST || "not set",
      DB_PORT: process.env.DB_PORT || "not set",
      DB_NAME: process.env.DB_NAME || "not set",
      DB_USER: process.env.DB_USER || "not set",
      DB_PASSWORD: process.env.DB_PASSWORD ? "set" : "not set",
    }

    console.log("Environment variables:", envCheck)

    // Test database connection
    const dbConnected = await testConnection()
    console.log("Database connection result:", dbConnected)

    return NextResponse.json({
      success: true,
      message: "API is working",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      connectionDetails: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      },
    })
  } catch (error: any) {
    console.error("API test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "API test failed",
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
