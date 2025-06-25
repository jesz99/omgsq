"use client"

// API client for frontend requests
class ApiClient {
  private baseUrl: string

  constructor() {
    // In development, use relative URLs to avoid CORS issues
    this.baseUrl = typeof window !== "undefined" && window.location.origin ? "" : ""
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // Include cookies for auth
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    console.log("Attempting login for:", email)

    // Always try demo login first since database might not be available
    try {
      console.log("Trying demo login...")
      const result = await this.request("/demo-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      console.log("Demo login result:", result)
      return result
    } catch (demoError) {
      console.log("Demo login failed:", demoError)

      // If demo login fails, try regular login
      try {
        console.log("Trying regular login...")
        const result = await this.request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        })
        console.log("Regular login result:", result)
        return result
      } catch (regularError) {
        console.error("Both login methods failed:", { demoError, regularError })
        throw regularError
      }
    }
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  async getCurrentUser() {
    return this.request("/auth/me")
  }

  // Users methods
  async getUsers() {
    return this.request("/users")
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Clients methods
  async getClients() {
    return this.request("/clients")
  }

  async createClient(clientData: any) {
    return this.request("/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    })
  }

  // Invoices methods
  async getInvoices() {
    return this.request("/invoices")
  }

  async createInvoice(invoiceData: any) {
    return this.request("/invoices", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    })
  }

  async updateInvoiceStatus(invoiceId: string, status: string) {
    return this.request(`/invoices/${invoiceId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }


  // Invoice PDF generation
  async generateInvoicePDF(invoiceId: string) {
    const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to generate PDF")
    }

    return response.blob()
  }


  // Tasks methods
  async getTasks() {
    return this.request("/tasks")
  }

  async createTask(taskData: any) {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async updateTaskStatus(taskId: string, status: string, completed_hours?: number) {
    return this.request(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, completed_hours }),
    })
  }

  // Enhanced Tasks methods
  async getEnhancedTasks(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/tasks-enhanced${queryString}`)
  }

  async createEnhancedTask(taskData: any) {
    return this.request("/tasks-enhanced", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async updateEnhancedTask(taskId: string, updates: any) {
    return this.request(`/tasks-enhanced/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  async getTaskDetails(taskId: string) {
    return this.request(`/tasks-enhanced/${taskId}`)
  }

  // Subtasks methods
  async createSubtask(subtaskData: any) {
    return this.request("/subtasks", {
      method: "POST",
      body: JSON.stringify(subtaskData),
    })
  }

  async updateSubtask(subtaskId: string, updates: any) {
    return this.request(`/subtasks/${subtaskId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  async deleteSubtask(subtaskId: string) {
    return this.request(`/subtasks/${subtaskId}`, {
      method: "DELETE",
    })
  }

  // Payments methods
  async getPayments() {
    return this.request("/payments")
  }

  async createPayment(paymentData: any) {
    return this.request("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  // Analytics methods
  async getAnalytics() {
    return this.request("/analytics")
  }

  // Team methods
  async getTeamPerformance() {
    return this.request("/team-performance")
  }

  async getTeamOverview() {
    return this.request("/team-overview")
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }

  // Master data methods
  async getMasterData(type?: string) {
    const endpoint = type ? `/master-data?type=${type}` : "/master-data"
    return this.request(endpoint)
  }

  // Task Reports methods
  async getTaskReports(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/task-reports${queryString}`)
  }

  // Check-ins methods
  async getCheckins(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/checkins${queryString}`)
  }

  async createCheckin(checkinData: any) {
    return this.request("/checkins", {
      method: "POST",
      body: JSON.stringify(checkinData),
    })
  }

  async getCheckinReports(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/checkins/reports${queryString}`)
  }
}

export const apiClient = new ApiClient()
