"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Target, TrendingUp, Clock, Loader2, Award, Star, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function TeamPerformancePage() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    } else if (user) {
      loadTeamPerformance()
    }
  }, [user, loading])

  const loadTeamPerformance = async () => {
    try {
      const response = await apiClient.getTeamPerformance()
      if (response.success) {
        setPerformanceData(response)
      }
    } catch (error) {
      console.error("Failed to load team performance:", error)
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

  // Use performanceData instead of hardcoded data
  const teamMembers = performanceData?.teamMembers || []
  const performanceTrend = performanceData?.performanceTrends || []
  const skillsData = performanceData?.skillsData || []

  const kpiData = [
    { name: "Task Completion", value: 94, target: 90, status: "above" },
    { name: "Quality Score", value: 92, target: 95, status: "below" },
    { name: "Client Satisfaction", value: 4.6, target: 4.5, status: "above" },
    { name: "Response Time", value: 2.3, target: 3.0, status: "above" },
    { name: "Revenue per Member", value: 14833, target: 15000, status: "below" },
  ]

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 95) return <Star className="h-4 w-4 text-yellow-500" />
    if (performance >= 90) return <Award className="h-4 w-4 text-blue-500" />
    if (performance < 80) return <AlertTriangle className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Performance</h1>
            <p className="text-muted-foreground">Detailed performance analytics and insights</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">90.3%</div>
              <p className="text-xs text-muted-foreground">+3.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">88%</div>
              <p className="text-xs text-muted-foreground">Above target</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">94%</div>
              <p className="text-xs text-muted-foreground">Excellent quality</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">4.6/5</div>
              <p className="text-xs text-muted-foreground">High satisfaction</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2.3h</div>
              <p className="text-xs text-muted-foreground">Under target</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance Overview</CardTitle>
                  <CardDescription>Current performance metrics by team member</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamMembers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="performance" fill="#3b82f6" name="Performance %" />
                      <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Performance</CardTitle>
                  <CardDescription>Correlation between performance and revenue generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamMembers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#f59e0b" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Individual Performance</CardTitle>
                <CardDescription>Detailed breakdown by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/placeholder-user-${member.id}.jpg`} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{member.name}</h4>
                            {getPerformanceBadge(member.performance)}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <Badge variant="secondary" className="text-xs">
                            Trend: {member.trend}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className={`text-lg font-bold ${getPerformanceColor(member.performance)}`}>
                            {member.performance}%
                          </p>
                          <p className="text-xs text-muted-foreground">Performance</p>
                          <Progress value={member.performance} className="w-16 h-2 mt-1" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{member.efficiency}%</p>
                          <p className="text-xs text-muted-foreground">Efficiency</p>
                          <Progress value={member.efficiency} className="w-16 h-2 mt-1" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{member.quality}%</p>
                          <p className="text-xs text-muted-foreground">Quality</p>
                          <Progress value={member.quality} className="w-16 h-2 mt-1" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{member.clientSatisfaction}</p>
                          <p className="text-xs text-muted-foreground">Client Rating</p>
                          <Progress value={(member.clientSatisfaction / 5) * 100} className="w-16 h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>6-month performance trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="john" stroke="#3b82f6" strokeWidth={2} name="John Doe" />
                    <Line type="monotone" dataKey="jane" stroke="#10b981" strokeWidth={2} name="Jane Smith" />
                    <Line type="monotone" dataKey="mike" stroke="#f59e0b" strokeWidth={2} name="Mike Johnson" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills Assessment</CardTitle>
                <CardDescription>Radar chart showing skill levels across team members</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={skillsData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="John Doe" dataKey="john" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                    <Radar name="Jane Smith" dataKey="jane" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Radar name="Mike Johnson" dataKey="mike" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Team KPIs vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpiData.map((kpi) => (
                    <div key={kpi.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{kpi.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {typeof kpi.value === "number" && kpi.value > 100 ? kpi.value.toLocaleString() : kpi.value}
                            {kpi.name.includes("Satisfaction") ? "/5" : kpi.name.includes("Time") ? "h" : "%"}
                          </span>
                          <Badge
                            className={
                              kpi.status === "above" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {kpi.status === "above" ? "Above Target" : "Below Target"}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${kpi.status === "above" ? "bg-green-600" : "bg-red-600"}`}
                          style={{
                            width: `${Math.min((kpi.value / (kpi.target * 1.2)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Target: {kpi.target}
                          {kpi.name.includes("Satisfaction") ? "/5" : kpi.name.includes("Time") ? "h" : "%"}
                        </span>
                        <span>
                          {kpi.status === "above" ? "+" : ""}
                          {(((kpi.value - kpi.target) / kpi.target) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
