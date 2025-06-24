"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, LogIn, Loader2, AlertTriangle, RefreshCw } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@omgs.com") // Pre-fill demo email
  const [password, setPassword] = useState("admin123") // Pre-fill demo password
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const { user, login, loading } = useAuth()

  // Check API status on mount
  useEffect(() => {
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    setApiStatus("checking")
    try {
      console.log("Checking API status...")
      const response = await fetch("/api/test")
      const data = await response.json()

      console.log("API test response:", data)
      setConnectionDetails(data)

      if (data.success) {
        setApiStatus("ok")
        if (data.database === "disconnected") {
          console.log("Database disconnected, but API is working - demo mode available")
        } else {
          setError("") // Clear any previous errors
        }
      } else {
        setApiStatus("error")
        setError(`API Error: ${data.error} - ${data.details}`)
      }
    } catch (error: any) {
      console.error("API check failed:", error)
      setApiStatus("error")
      setError(`Failed to connect to API: ${error.message}`)
    }
  }

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log("User is logged in, redirecting to dashboard")
      window.location.href = "/dashboard"
    }
  }, [user, loading])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("Login form submitted:", { email, password })

    try {
      const result = await login(email, password)
      console.log("Login result:", result)

      if (result.success) {
        console.log("Login successful, redirecting...")
        window.location.href = "/dashboard"
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (role: string) => {
    const credentials = {
      admin: { email: "admin@omgs.com", password: "admin123" },
      finance: { email: "finance@omgs.com", password: "admin123" },
      director: { email: "director@omgs.com", password: "admin123" },
      leader: { email: "john.smith@omgs.com", password: "admin123" },
      member: { email: "mike.wilson@omgs.com", password: "admin123" },
    }
    const cred = credentials[role as keyof typeof credentials]
    if (cred) {
      setEmail(cred.email)
      setPassword(cred.password)
    }
  }

  // Show loading while checking auth
  if (loading || apiStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{loading ? "Checking authentication..." : "Connecting to API..."}</p>
        </div>
      </div>
    )
  }

  // Don't show login form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">OMGS</CardTitle>
          <CardDescription>One Management Good Solutions</CardDescription>
        </CardHeader>
        <CardContent>
          {apiStatus === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>API connection failed. Please check your server configuration.</p>
                  {connectionDetails && (
                    <details className="text-xs">
                      <summary className="cursor-pointer">Connection Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(connectionDetails, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <Button variant="outline" size="sm" className="ml-2 mt-2" onClick={checkApiStatus}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {apiStatus === "ok" && connectionDetails?.database === "disconnected" && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <p>Database is offline. Demo mode is available with the credentials below.</p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Demo credentials (password: admin123):</p>
            <div className="grid grid-cols-1 gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillDemoCredentials("admin")}
                type="button"
              >
                Admin: admin@omgs.com
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillDemoCredentials("finance")}
                type="button"
              >
                Finance: finance@omgs.com
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillDemoCredentials("director")}
                type="button"
              >
                Director: director@omgs.com
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillDemoCredentials("leader")}
                type="button"
              >
                Team Leader: john.smith@omgs.com
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillDemoCredentials("member")}
                type="button"
              >
                Team Member: mike.wilson@omgs.com
              </Button>
            </div>
          </div>

          {apiStatus === "ok" && (
            <div className="mt-4 text-center">
              <p className="text-xs text-green-600">
                ✓ API Connected | Database:{" "}
                {connectionDetails?.database === "connected" ? "✓ Connected" : "⚠ Demo Mode"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
