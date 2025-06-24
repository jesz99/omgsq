import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

// Initialize database connection pool
export function getDb() {
  if (!pool) {
    try {
      const config = {
        host: process.env.DB_HOST || "localhost",
        port: Number.parseInt(process.env.DB_PORT || "3306"),
        database: process.env.DB_NAME || "omgs_invoice_tracking",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        // Remove deprecated options
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }

      console.log("Database config:", {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password ? "***" : "not set",
      })

      pool = mysql.createPool(config)

      // Test the connection
      pool.on("connection", (connection) => {
        console.log("New MySQL connection established as id " + connection.threadId)
      })

      pool.on("error", (err) => {
        console.error("Database pool error:", err)
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          console.log("Database connection was closed.")
        }
        if (err.code === "ER_CON_COUNT_ERROR") {
          console.log("Database has too many connections.")
        }
        if (err.code === "ECONNREFUSED") {
          console.log("Database connection was refused.")
        }
      })
    } catch (error) {
      console.error("Failed to create database pool:", error)
      throw error
    }
  }
  return pool
}

// Close database connection (for cleanup)
export async function closeDb() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Database query helper with error handling
export async function query(text: string, params?: any[]) {
  try {
    const db = getDb()
    const [results] = await db.execute(text, params)
    return { rows: results }
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query:", text)
    console.error("Params:", params)
    throw error
  }
}

// Test database connection with detailed error reporting
export async function testConnection() {
  try {
    console.log("Testing database connection...")

    // Check if environment variables are set
    const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars)
      return false
    }

    const db = getDb()

    // Test with a simple query
    const [results] = await db.execute("SELECT \"1\" AS 'test', NOW() AS 'CURRENT_TIME'")
    console.log("Database connection successful:", results)
    return true
  } catch (error: any) {
    console.error("Database connection failed:", error)
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)

    // Provide specific error messages
    if (error.code === "ECONNREFUSED") {
      console.error("Connection refused - check if MySQL server is running and accessible")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("Access denied - check username and password")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("Database does not exist - check database name")
    } else if (error.code === "ENOTFOUND") {
      console.error("Host not found - check database host")
    }

    return false
  }
}

// Transaction helper
export async function transaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
  const db = getDb()
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
