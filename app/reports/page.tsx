"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { FileText, Download, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react"

export default function ReportsPage() {
  const { user, loading } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedYear, setSelectedYear] = useState("2024")

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    }
  }, [user, loading])

  if (loading) {
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

  // Sample data for reports
  const monthlyRevenue = [
    { month: "Jan", revenue: 85000, invoices: 120, paid: 95000 },
    { month: "Feb", revenue: 92000, invoices: 135, paid: 88000 },
    { month: "Mar", revenue: 78000, invoices: 110, paid: 82000 },
    { month: "Apr", revenue: 105000, invoices: 145, paid: 98000 },
    { month: "May", revenue: 118000, invoices: 160, paid: 115000 },
    { month: "Jun", revenue: 124500, invoices: 175, paid: 120000 },
  ]

  const clientCategories = [
    { name: "Monthly", value: 45, color: "#3b82f6" },
    { name: "Yearly", value: 30, color: "#10b981" },
    { name: "As per case", value: 25, color: "#f59e0b" },
  ]

  const teamPerformance = [
    { team: "Team Alpha", revenue: 45000, clients: 25, completion: 92 },
    { team: "Team Beta", revenue: 38500, clients: 20, completion: 88 },
    { team: "Team Gamma", revenue: 41000, clients: 22, completion: 95 },
  ]

  const paymentMethods = [
    { method: "Bank Transfer", count: 45, percentage: 60 },
    { method: "Check", count: 18, percentage: 24 },
    { method: "Online Transfer", count: 9, percentage: 12 },
    { method: "Credit Card", count: 3, percentage: 4 },
  ]

  const overdueAnalysis = [
    { range: "1-7 days", count: 5, amount: 12500 },
    { range: "8-15 days", count: 3, amount: 8200 },
    { range: "16-30 days", count: 2, amount: 5800 },
    { range: "30+ days", count: 1, amount: 3200 },
  ]

  const generateReport = (reportType: string) => {
    console.log(`Generating ${reportType} report...`)
    // In a real app, this would trigger report generation and download
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Financial reports and business insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$602,500</div>
                  <p className="text-xs text-muted-foreground">+12.5% from last period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">845</div>
                  <p className="text-xs text-muted-foreground">+8.2% from last period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">67</div>
                  <p className="text-xs text-muted-foreground">+3.1% from last period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last period</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue and payment collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Collected" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Distribution</CardTitle>
                  <CardDescription>Clients by service category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={clientCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {clientCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Generate and download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <Button variant="outline" onClick={() => generateReport("monthly")}>
                    <Download className="mr-2 h-4 w-4" />
                    Monthly Report
                  </Button>
                  <Button variant="outline" onClick={() => generateReport("quarterly")}>
                    <Download className="mr-2 h-4 w-4" />
                    Quarterly Report
                  </Button>
                  <Button variant="outline" onClick={() => generateReport("annual")}>
                    <Download className="mr-2 h-4 w-4" />
                    Annual Report
                  </Button>
                  <Button variant="outline" onClick={() => generateReport("tax")}>
                    <Download className="mr-2 h-4 w-4" />
                    Tax Summary
                  </Button>
                  <Button variant="outline" onClick={() => generateReport("client")}>
                    <Download className="mr-2 h-4 w-4" />
                    Client Report
                  </Button>
                  <Button variant="outline" onClick={() => generateReport("overdue")}>
                    <Download className="mr-2 h-4 w-4" />
                    Overdue Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Total Revenue" />
                    <Bar dataKey="paid" fill="#10b981" name="Collected" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Categories</CardTitle>
                  <CardDescription>Distribution of clients by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientCategories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary">{category.value}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Growth</CardTitle>
                  <CardDescription>New clients acquired over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="invoices" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Breakdown of payment methods used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.method} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{method.method}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{method.count}</span>
                          <Badge variant="secondary">{method.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overdue Analysis</CardTitle>
                  <CardDescription>Breakdown of overdue invoices by age</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overdueAnalysis.map((item) => (
                      <div key={item.range} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.range}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{item.count} invoices</span>
                          <Badge variant="destructive">${item.amount.toLocaleString()}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Revenue and performance metrics by team</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
