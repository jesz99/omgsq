"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Plus, Search, Eye, Download, Send, Loader2 } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"

export default function InvoicesPage() {
  const { user, loading } = useAuth()
  const { masterData, loading: masterDataLoading } = useMasterData()
  const [invoices, setInvoices] = useState([
    {
      id: "INV-001",
      client: "ABC Corporation",
      amount: 2500,
      period: "January 2024",
      dueDate: "2024-01-31",
      status: "Sent",
      bankAccount: "Bank A - 123456789",
      createdDate: "2024-01-01",
    },
    {
      id: "INV-002",
      client: "XYZ Industries",
      amount: 1800,
      period: "Q4 2023",
      dueDate: "2024-02-15",
      status: "Draft",
      bankAccount: "Bank B - 987654321",
      createdDate: "2024-01-05",
    },
    {
      id: "INV-003",
      client: "Tech Solutions Ltd",
      amount: 3200,
      period: "December 2023",
      dueDate: "2024-01-15",
      status: "Overdue",
      bankAccount: "Bank A - 123456789",
      createdDate: "2023-12-15",
    },
    {
      id: "INV-004",
      client: "Global Enterprises",
      amount: 4100,
      period: "January 2024",
      dueDate: "2024-01-20",
      status: "Paid",
      bankAccount: "Bank C - 456789123",
      createdDate: "2024-01-01",
    },
  ])

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    client: "",
    period: "",
    amount: "",
    dueDate: "",
    bankAccount: "",
    notes: "",
  })

  // Remove static arrays and use master data:
  // const clients = ["ABC Corporation", "XYZ Industries", "Tech Solutions Ltd", "Global Enterprises"]
  // const bankAccounts = ["Bank A - 123456789", "Bank B - 987654321", "Bank C - 456789123"]

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    }
  }, [user, loading])

  if (loading || masterDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const handleCreateInvoice = () => {
    if (newInvoice.client && newInvoice.amount && newInvoice.dueDate) {
      const invoice = {
        id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
        ...newInvoice,
        amount: Number.parseFloat(newInvoice.amount),
        status: "Draft",
        createdDate: new Date().toISOString().split("T")[0],
      }
      setInvoices([...invoices, invoice])
      setNewInvoice({ client: "", period: "", amount: "", dueDate: "", bankAccount: "", notes: "" })
      setIsCreateInvoiceOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Sent: "bg-blue-100 text-blue-800",
      Paid: "bg-green-100 text-green-800",
      Overdue: "bg-red-100 text-red-800",
      Done: "bg-purple-100 text-purple-800",
    }
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const updateInvoiceStatus = (invoiceId: string, newStatus: string) => {
    setInvoices(invoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv)))
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Invoice Management</h1>
            <p className="text-muted-foreground">Create and manage client invoices</p>
          </div>
          <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Generate a new invoice for a client.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={newInvoice.client}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, client: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.clients.map((client) => (
                        <SelectItem key={client.id} value={client.name}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    value={newInvoice.period}
                    onChange={(e) => setNewInvoice({ ...newInvoice, period: e.target.value })}
                    placeholder="e.g., January 2024, Q1 2024"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Select
                    value={newInvoice.bankAccount}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, bankAccount: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={`${account.name} - ${account.account_number}`}>
                          {account.name} - {account.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateInvoice}>
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter((inv) => inv.status === "Draft").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter((inv) => inv.status === "Overdue").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Manage and track invoice status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="max-w-sm" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.client}</p>
                        <p className="text-sm text-muted-foreground">{invoice.period}</p>
                      </div>
                    </TableCell>
                    <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === "Draft" && (
                          <Button variant="ghost" size="sm" onClick={() => updateInvoiceStatus(invoice.id, "Sent")}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === "Sent" && (
                          <Button variant="ghost" size="sm" onClick={() => updateInvoiceStatus(invoice.id, "Paid")}>
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
