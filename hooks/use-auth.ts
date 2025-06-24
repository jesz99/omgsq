"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...")
      const response = await apiClient.getCurrentUser()
      console.log("Auth check response:", response)

      if (response.success) {
        console.log("User authenticated:", response.user)
        setUser(response.user)
      } else {
        console.log("User not authenticated:", response.error)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("Login attempt:", email)
      const response = await apiClient.login(email, password)
      console.log("Login response:", response)

      if (response.success) {
        console.log("Login successful, setting user:", response.user)
        setUser(response.user)
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
      // Force logout even if API call fails
      setUser(null)
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    checkAuth,
  }
}
