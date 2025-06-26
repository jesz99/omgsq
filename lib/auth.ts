import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "team_member" | "team_leader" | "finance" | "director"
  status: "active" | "inactive"
  phone?: string
  address?: string
  photo_url?: string
  team_leader_id?: string
  join_date: string
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await query("SELECT * FROM users WHERE email = ? AND status = ?", [email, "active"])

    if (result.rows.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = result.rows[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword)

    return {
      success: true,
      user: userWithoutPassword,
      token,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await query(
      "SELECT id, name, email, role, status, phone, address, photo_url, team_leader_id, join_date FROM users WHERE id = ?",
      [id],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

// Create audit log
export async function createAuditLog(
  userId: string,
  action: string,
  tableName: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, tableName, recordId, JSON.stringify(oldValues), JSON.stringify(newValues)],
    )
  } catch (error) {
    console.error("Audit log error:", error)
  }
}
