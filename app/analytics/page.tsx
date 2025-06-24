"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
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
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Users, FileText, Loader2, Target, Clock } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    } else if (user) {
      loadAnalytics()
    }
  }, [user, loading])

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.getAnalytics()
      if (response.success) {
        setAnalyticsData(response.analytics)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

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

  // Use analyticsData instead of hardcoded data
  const revenueData = analyticsData?.revenue || []
  const teamEfficiency = analyticsData?.teamPerformance || []
  const clientRetention = analyticsData?.clientAnalytics || []
  const invoiceFlow = analyticsData?.invoiceFlow || []
  const kpiData = analyticsData?.kpiData || []

  const profitabilityData = [
    { month: "Jul", profit: 25500, margin: 30 },
    { month: "Aug", profit: 32200, margin: 35 },
    { month: "Sep", profit: 23400, margin: 30 },
    { month: "Oct", profit: 42000, margin: 40 },
    { month: "Nov", profit: 47200, margin: 40 },
    { month: "Dec", profit: 49800, margin: 40 },
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Business Analytics</h1>
            <p className="text-muted-foreground">Advanced insights and performance metrics</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+22.1%</div>
              <p className="text-xs text-muted-foreground">vs last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">40%</div>
              <p className="text-xs text-muted-foreground">+5% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">86%</div>
              <p className="text-xs text-muted-foreground">Above industry avg</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Collection</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">12.3</div>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoice Success</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">86%</div>
              <p className="text-xs text-muted-foreground">payment rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <p className="text-xs text-muted-foreground">avg across teams</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="teams">Team Performance</TabsTrigger>
            <TabsTrigger value="clients">Client Analytics</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Target</CardTitle>
                  <CardDescription>Monthly performance against targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profitability Trend</CardTitle>
                  <CardDescription>Profit and margin analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={profitabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rate Analysis</CardTitle>
                <CardDescription>Month-over-month growth percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="growth" stroke="#f59e0b" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Efficiency Comparison</CardTitle>
                  <CardDescription>Performance metrics by team</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamEfficiency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="team" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Revenue Distribution</CardTitle>
                  <CardDescription>Revenue contribution by team</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={teamEfficiency}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                        label={({ team, revenue }) => `${team}: $${revenue.toLocaleString()}`}
                      >
                        {teamEfficiency.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <CardTitle>Team Performance Metrics</CardTitle>
                <CardDescription>Detailed performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamEfficiency.map((team, index) => (
                    <div key={team.team} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <h4 className="font-semibold">{team.team}</h4>
                          <p className="text-sm text-muted-foreground">{team.clients} clients</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">${team.revenue.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{team.efficiency}%</p>
                          <p className="text-xs text-muted-foreground">Efficiency</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{team.avgDays} days</p>
                          <p className="text-xs text-muted-foreground">Avg Collection</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Retention by Category</CardTitle>
                  <CardDescription>Retention rates across service types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientRetention.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">{category.retention}% retention</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${category.retention}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Value: ${category.value.toLocaleString()}</span>
                          <span>Churn: {category.churn}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Conversion Funnel</CardTitle>
                  <CardDescription>Invoice lifecycle conversion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoiceFlow.map((stage, index) => (
                      <div key={stage.stage} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium">{stage.stage}</div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{stage.count} invoices</span>
                            <span className="text-sm text-muted-foreground">{stage.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stage.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Operational KPIs</CardTitle>
                  <CardDescription>Key operational metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Invoice Processing</span>
                      <Badge variant="secondary">2.3 days</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Client Response Time</span>
                      <Badge variant="secondary">4.2 hours</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Document Accuracy</span>
                      <Badge className="bg-green-100 text-green-800">98.5%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">System Uptime</span>
                      <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                  <CardDescription>Service quality indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Client Satisfaction</span>
                      <Badge className="bg-green-100 text-green-800">4.8/5</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="secondary">0.8%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rework Required</span>
                      <Badge variant="secondary">2.1%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">On-time Delivery</span>
                      <Badge className="bg-green-100 text-green-800">96.2%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Trends</CardTitle>
                  <CardDescription>Process improvement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Automation Rate</span>
                      <Badge className="bg-blue-100 text-blue-800">67%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cost per Invoice</span>
                      <Badge variant="secondary">$12.50</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Resource Utilization</span>
                      <Badge className="bg-green-100 text-green-800">89%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Process Efficiency</span>
                      <Badge className="bg-green-100 text-green-800">92%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
