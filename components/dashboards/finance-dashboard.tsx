"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react"

export function FinanceDashboard() {
  const stats = [
    { title: "Total Invoices", value: "156", icon: FileText, change: "+12 this month" },
    { title: "Unpaid Amount", value: "Rp 45,230,000", icon: DollarSign, change: "23 invoices" },
    { title: "Overdue", value: "8", icon: AlertTriangle, change: "Needs attention" },
    { title: "Paid This Month", value: "Rp 78,450,000", icon: CheckCircle, change: "+15% from last month" },
  ]

  const recentInvoices = [
    { id: "INV-001", client: "ABC Corp", amount: "Rp 2,500,000", dueDate: "2024-01-15", status: "Overdue" },
    { id: "INV-002", client: "XYZ Ltd", amount: "Rp 1,800,000", dueDate: "2024-01-20", status: "Sent" },
    { id: "INV-003", client: "Tech Solutions", amount: "Rp 3,200,000", dueDate: "2024-01-25", status: "Draft" },
    { id: "INV-004", client: "Global Inc", amount: "Rp 4,100,000", dueDate: "2024-01-30", status: "Paid" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "Sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
      case "Overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Finance</h1>
          <p className="text-muted-foreground">Lacak Invoice</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invoice Baru
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Invoice yang butuh diperhatikan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">8 Invoice Lewat Jatuh Tempo</span>
              </div>
              <Button size="sm" variant="destructive">
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">5 Draft Invoice</span>
              </div>
              <Button size="sm" variant="outline">
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Invoice</CardTitle>
            <CardDescription>Aktivitas Terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
