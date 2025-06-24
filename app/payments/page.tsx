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
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  Download,
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { useMasterData } from "@/hooks/use-master-data"

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth()
  const { masterData, loading: masterDataLoading } = useMasterData()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    invoiceId: "",
    amount: "",
    paymentDate: "",
    method: "",
    reference: "",
    bankAccount: "",
    notes: "",
  })

  // Remove the static arrays and use master data instead:
  // const invoices = ["INV-001", "INV-002", "INV-003", "INV-004", "INV-005"]
  // const paymentMethods = ["Bank Transfer", "Check", "Online Transfer", "Credit Card", "Cash"]
  // const bankAccounts = ["Bank A - 123456789", "Bank B - 987654321", "Bank C - 456789123"]

  const invoices = ["INV-001", "INV-002", "INV-003", "INV-004", "INV-005"]
  const paymentMethods = ["Bank Transfer", "Check", "Online Transfer", "Credit Card", "Cash"]
  const bankAccounts = ["Bank A - 123456789", "Bank B - 987654321", "Bank C - 456789123"]

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/"
    } else if (user) {
      loadPayments()
    }
  }, [user, authLoading])

  const loadPayments = async () => {
    try {
      const response = await apiClient.getPayments()
      if (response.success) {
        const formattedPayments = response.payments.map((payment) => ({
          id: payment.id,
          invoiceId: payment.invoice_number,
          client: payment.client_name,
          amount: payment.amount,
          paymentDate: payment.payment_date,
          method: payment.payment_method,
          reference: payment.reference_number,
          status: payment.status,
          bankAccount: payment.bank_account || "Bank A - 123456789",
          notes: payment.notes || "",
        }))
        setPayments(formattedPayments)
      }
    } catch (error) {
      console.error("Failed to load payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (newPayment.invoiceId && newPayment.amount && newPayment.paymentDate) {
      try {
        const response = await apiClient.createPayment({
          invoice_id: newPayment.invoiceId,
          payment_method: newPayment.method,
          amount: Number.parseFloat(newPayment.amount),
          payment_date: newPayment.paymentDate,
          reference_number: newPayment.reference,
          notes: newPayment.notes,
        })

        if (response.success) {
          await loadPayments()
          setNewPayment({
            invoiceId: "",
            amount: "",
            paymentDate: "",
            method: "",
            reference: "",
            bankAccount: "",
            notes: "",
          })
          setIsRecordPaymentOpen(false)
        }
      } catch (error) {
        console.error("Failed to record payment:", error)
      }
    }
  }

  if (loading || authLoading) {
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

  const getStatusBadge = (status: string) => {
    const colors = {
      Confirmed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
      Processing: "bg-blue-100 text-blue-800",
    }
    const icons = {
      Confirmed: CheckCircle,
      Pending: Clock,
      Failed: AlertTriangle,
      Processing: Clock,
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      "Bank Transfer": "bg-blue-100 text-blue-800",
      Check: "bg-purple-100 text-purple-800",
      "Online Transfer": "bg-green-100 text-green-800",
      "Credit Card": "bg-orange-100 text-orange-800",
      Cash: "bg-gray-100 text-gray-800",
    }
    return <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{method}</Badge>
  }

  const updatePaymentStatus = (paymentId: string, newStatus: string) => {
    setPayments(payments.map((payment) => (payment.id === paymentId ? { ...payment, status: newStatus } : payment)))
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-muted-foreground">Track and manage client payments</p>
          </div>
          <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>Record a payment received from a client.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="invoiceId">Invoice</Label>
                  <Select
                    value={newPayment.invoiceId}
                    onValueChange={(value) => setNewPayment({ ...newPayment, invoiceId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((invoice) => (
                        <SelectItem key={invoice} value={invoice}>
                          {invoice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    placeholder="Enter payment amount"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select
                    value={newPayment.method}
                    onValueChange={(value) => setNewPayment({ ...newPayment, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.name}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                    placeholder="Transaction reference"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Select
                    value={newPayment.bankAccount}
                    onValueChange={(value) => setNewPayment({ ...newPayment, bankAccount: value })}
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
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleRecordPayment}>
                  Record Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.filter((p) => p.status === "Confirmed").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.filter((p) => p.status === "Pending").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {payments
                  .filter((p) => p.status === "Confirmed")
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All recorded payments and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payments..." className="max-w-sm" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.invoiceId}</TableCell>
                    <TableCell>{payment.client}</TableCell>
                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{getMethodBadge(payment.method)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{payment.paymentDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {payment.status === "Pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updatePaymentStatus(payment.id, "Confirmed")}
                          >
                            Confirm
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
