"use client"

import { useState, useEffect } from "react"

interface MasterData {
  paymentMethods: any[]
  taskCategories: any[]
  priorities: any[]
  clientCategories: any[]
  invoiceStatuses: any[]
  taskStatuses: any[]
  userRoles: any[]
  bankAccounts: any[]
  clients: any[]
}

export function useMasterData() {
  const [masterData, setMasterData] = useState<MasterData>({
    paymentMethods: [],
    taskCategories: [],
    priorities: [],
    clientCategories: [],
    invoiceStatuses: [],
    taskStatuses: [],
    userRoles: [],
    bankAccounts: [],
    clients: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMasterData()
  }, [])

  const loadMasterData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/master-data")
      const result = await response.json()

      if (result.success) {
        setMasterData(result.data)
      } else {
        setError(result.error || "Failed to load master data")
      }
    } catch (err) {
      console.error("Master data loading error:", err)
      setError("Failed to load master data")

      // Fallback to static data if API fails
      setMasterData({
        paymentMethods: [
          { id: "1", name: "Bank Transfer" },
          { id: "2", name: "Check" },
          { id: "3", name: "Online Transfer" },
          { id: "4", name: "Credit Card" },
          { id: "5", name: "Cash" },
        ],
        taskCategories: [
          { id: "1", name: "Client Management", icon: "User", color: "blue" },
          { id: "2", name: "Tax Preparation", icon: "FileText", color: "green" },
          { id: "3", name: "Bookkeeping", icon: "Calculator", color: "purple" },
          { id: "4", name: "Consultation", icon: "MessageCircle", color: "orange" },
          { id: "5", name: "Documentation", icon: "FileText", color: "gray" },
          { id: "6", name: "Meeting", icon: "Calendar", color: "yellow" },
          { id: "7", name: "Collections", icon: "AlertTriangle", color: "red" },
        ],
        priorities: [
          { id: "1", name: "Critical", level: 1, color: "red" },
          { id: "2", name: "High", level: 2, color: "orange" },
          { id: "3", name: "Medium", level: 3, color: "yellow" },
          { id: "4", name: "Low", level: 4, color: "green" },
        ],
        clientCategories: [
          { id: "1", name: "Monthly", billing_frequency: "monthly", default_due_day: 15 },
          { id: "2", name: "Quarterly", billing_frequency: "quarterly", default_due_day: 30 },
          { id: "3", name: "Yearly", billing_frequency: "yearly", default_due_day: 31 },
          { id: "4", name: "As Per Case", billing_frequency: "as_needed", default_due_day: null },
        ],
        invoiceStatuses: [
          { id: "1", name: "Draft", color: "gray" },
          { id: "2", name: "Sent", color: "blue" },
          { id: "3", name: "Paid", color: "green" },
          { id: "4", name: "Overdue", color: "red" },
          { id: "5", name: "Done", color: "purple" },
        ],
        taskStatuses: [
          { id: "1", name: "Pending", color: "gray" },
          { id: "2", name: "In Progress", color: "blue" },
          { id: "3", name: "Completed", color: "green" },
          { id: "4", name: "Overdue", color: "red" },
          { id: "5", name: "Scheduled", color: "purple" },
        ],
        userRoles: [
          { id: "1", name: "admin" },
          { id: "2", name: "director" },
          { id: "3", name: "finance" },
          { id: "4", name: "team_leader" },
          { id: "5", name: "team_member" },
        ],
        bankAccounts: [
          { id: "1", name: "Primary Business Account", account_number: "1234567890" },
          { id: "2", name: "Secondary Account", account_number: "0987654321" },
          { id: "3", name: "Tax Payment Account", account_number: "1122334455" },
        ],
        clients: [
          { id: "1", name: "ABC Corporation" },
          { id: "2", name: "XYZ Industries" },
          { id: "3", name: "Tech Solutions Ltd" },
          { id: "4", name: "Global Enterprises" },
          { id: "5", name: "StartUp Inc" },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshMasterData = () => {
    loadMasterData()
  }

  return {
    masterData,
    loading,
    error,
    refreshMasterData,
  }
}
