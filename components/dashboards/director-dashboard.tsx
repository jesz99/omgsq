"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, DollarSign, FileText, AlertTriangle, Users } from "lucide-react"

export function DirectorDashboard() {
  const kpis = [
    { title: "Total Invoices", value: "1,247", icon: FileText, change: "+8.2%", trend: "up" },
    { title: "Monthly Revenue", value: "$124,500", icon: DollarSign, change: "+12.5%", trend: "up" },
    { title: "Unpaid Invoices", value: "89", icon: AlertTriangle, change: "-5.3%", trend: "down" },
    { title: "Active Clients", value: "156", icon: Users, change: "+3.1%", trend: "up" },
  ]

  const monthlyData = [
    { month: "Jan", revenue: 85000, invoices: 120 },
    { month: "Feb", revenue: 92000, invoices: 135 },
    { month: "Mar", revenue: 78000, invoices: 110 },
    { month: "Apr", revenue: 105000, invoices: 145 },
    { month: "May", revenue: 118000, invoices: 160 },
    { month: "Jun", revenue: 124500, invoices: 175 },
  ]

  const teamPerformance = [
    { team: "Team Alpha", leader: "John Smith", clients: 45, revenue: 45000, completion: 92 },
    { team: "Team Beta", leader: "Sarah Johnson", clients: 38, revenue: 38500, completion: 88 },
    { team: "Team Gamma", leader: "Mike Wilson", clients: 42, revenue: 41000, completion: 95 },
  ]

  const overdueInvoices = [
    { client: "ABC Corporation", amount: "$5,200", days: 15, team: "Alpha" },
    { client: "XYZ Industries", amount: "$3,800", days: 8, team: "Beta" },
    { client: "Tech Solutions Ltd", amount: "$7,100", days: 22, team: "Gamma" },
    { client: "Global Enterprises", amount: "$2,900", days: 5, team: "Alpha" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Director Dashboard</h1>
        <p className="text-muted-foreground">Executive overview of business performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs">
                <TrendingUp className={`mr-1 h-3 w-3 ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                <span className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}>{kpi.change}</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue and invoice count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Revenue by team this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Overview</CardTitle>
          <CardDescription>Detailed performance metrics by team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance.map((team) => (
              <div key={team.team} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-semibold">{team.team}</h4>
                    <p className="text-sm text-muted-foreground">Led by {team.leader}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{team.clients}</p>
                    <p className="text-xs text-muted-foreground">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">${team.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-sm font-medium">{team.completion}%</p>
                    <Progress value={team.completion} className="w-20 h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Critical: Overdue Invoices
          </CardTitle>
          <CardDescription>Invoices requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overdueInvoices.map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">{invoice.client}</p>
                  <p className="text-sm text-muted-foreground">Team {invoice.team}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{invoice.amount}</p>
                  <Badge variant="destructive" className="text-xs">
                    {invoice.days} days overdue
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
