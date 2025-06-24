"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { FileText, TrendingUp, Calendar, Download, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react"

export default function TaskReportsPage() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  })
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedUser, setSelectedUser] = useState("all")

  useEffect(() => {
    if (user && ["admin", "director"].includes(user.role)) {
      loadReportData()
    }
  }, [user, dateRange, selectedCategory, selectedUser])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedUser !== "all" && { user_id: selectedUser }),
      })

      const response = await fetch(`/api/task-reports?${params}`)
      const result = await response.json()

      if (result.success) {
        setReportData(result.data)
      }
    } catch (error) {
      console.error("Failed to load report data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !["admin", "director"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">Only administrators and directors can access task reports.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !reportData) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
            <p>Loading task reports...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { summary, team_performance, category_distribution, completion_trend, recent_tasks } = reportData

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Task Reports</h1>
            <p className="text-muted-foreground">Comprehensive task management analytics and insights</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="CASE">CASE</SelectItem>
                    <SelectItem value="HARIAN">HARIAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Member</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {team_performance.map((member: any) => (
                      <SelectItem key={member.user_id} value={member.user_id.toString()}>
                        {member.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_tasks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.completed_tasks || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total_tasks > 0 ? Math.round((summary.completed_tasks / summary.total_tasks) * 100) : 0}%
                completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.in_progress_tasks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CASE Tasks</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary.case_tasks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HARIAN Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.daily_tasks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(summary.avg_progress || 0)}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Task Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={category_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {category_distribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Completed</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={summary.total_tasks > 0 ? (summary.completed_tasks / summary.total_tasks) * 100 : 0}
                          className="w-24"
                        />
                        <span className="text-sm font-medium">{summary.completed_tasks}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>In Progress</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={summary.total_tasks > 0 ? (summary.in_progress_tasks / summary.total_tasks) * 100 : 0}
                          className="w-24"
                        />
                        <span className="text-sm font-medium">{summary.in_progress_tasks}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={summary.total_tasks > 0 ? (summary.pending_tasks / summary.total_tasks) * 100 : 0}
                          className="w-24"
                        />
                        <span className="text-sm font-medium">{summary.pending_tasks}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overdue</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={summary.total_tasks > 0 ? (summary.overdue_tasks / summary.total_tasks) * 100 : 0}
                          className="w-24"
                        />
                        <span className="text-sm font-medium">{summary.overdue_tasks}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Individual team member task completion and productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team_performance.map((member: any) => (
                    <div key={member.user_id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{member.user_name}</h4>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {member.total_tasks > 0
                              ? Math.round((member.completed_tasks / member.total_tasks) * 100)
                              : 0}
                            %
                          </div>
                          <p className="text-sm text-muted-foreground">Completion Rate</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Tasks</p>
                          <p className="font-medium">{member.total_tasks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium text-green-600">{member.completed_tasks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">In Progress</p>
                          <p className="font-medium text-blue-600">{member.in_progress_tasks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CASE Tasks</p>
                          <p className="font-medium text-purple-600">{member.case_tasks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">HARIAN Tasks</p>
                          <p className="font-medium text-blue-600">{member.daily_tasks}</p>
                        </div>
                      </div>

                      <Progress
                        value={member.total_tasks > 0 ? (member.completed_tasks / member.total_tasks) * 100 : 0}
                        className="mt-3"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trend</CardTitle>
                <CardDescription>Daily task completion over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={completion_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed_tasks" stroke="#8884d8" name="Completed Tasks" />
                    <Line type="monotone" dataKey="total_tasks" stroke="#82ca9d" name="Total Tasks" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Latest task activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge
                            variant="outline"
                            className={
                              task.task_category === "CASE"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {task.task_category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Assigned to: {task.assigned_to_name}</span>
                          {task.client_name && <span>Client: {task.client_name}</span>}
                          <span>
                            Subtasks: {task.completed_subtasks}/{task.subtask_count}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            task.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "Overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }
                        >
                          {task.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{task.progress_percentage}%</div>
                          <Progress value={task.progress_percentage} className="w-16 h-2" />
                        </div>
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
