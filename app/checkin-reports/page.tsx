"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"
import {
  Bar,
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
import { Users, Clock, TrendingUp, AlertCircle, Calendar, Download } from "lucide-react"
import { format, subDays } from "date-fns"

interface ReportSummary {
  total_checkins: number
  active_users: number
  avg_productivity: number
  present_count: number
  late_count: number
  wfh_count: number
  leave_count: number
  avg_hours: number
  total_overtime: number
}

interface MoodData {
  mood: string
  count: number
  percentage: number
}

interface TrendData {
  checkin_date: string
  checkins: number
  avg_productivity: number
  present: number
  late: number
}

interface UserData {
  id: number
  name: string
  role: string
  total_checkins: number
  avg_productivity: number
  avg_hours: number
  total_overtime: number
  present_days: number
  late_days: number
  leave_days: number
  last_checkin: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function CheckInReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [userData, setUserData] = useState<UserData[]>([])
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  })

  useEffect(() => {
    if (user && ["Admin", "Director"].includes(user.role)) {
      fetchReports()
    }
  }, [user, dateRange])

  const fetchReports = async () => {
    setLoading(true)
    try {
      // Fetch summary report
      const summaryResponse = await apiClient.get(
        `/api/checkins/reports?type=summary&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      )
      setSummary(summaryResponse.summary)
      setMoodData(summaryResponse.moodDistribution || [])
      setTrendData(summaryResponse.dailyTrends || [])

      // Fetch detailed user report
      const detailedResponse = await apiClient.get(
        `/api/checkins/reports?type=detailed&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      )
      setUserData(detailedResponse.users || [])
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceRate = (presentDays: number, totalDays: number) => {
    if (totalDays === 0) return 0
    return Math.round((presentDays / totalDays) * 100)
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  if (!user || !["Admin", "Director"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Check-in reports are only available for administrators and directors.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-in Reports</h1>
          <p className="text-muted-foreground">Daily check-in analytics and team performance</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <Button onClick={fetchReports} disabled={loading}>
              {loading ? "Loading..." : "Update Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.total_checkins || 0}</div>
                <p className="text-xs text-muted-foreground">{summary?.active_users || 0} active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.avg_productivity ? summary.avg_productivity.toFixed(1) : "0"}/10
                </div>
                <p className="text-xs text-muted-foreground">Team average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.avg_hours ? summary.avg_hours.toFixed(1) : "0"}h</div>
                <p className="text-xs text-muted-foreground">{summary?.total_overtime || 0}h overtime</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary ? Math.round((summary.present_count / summary.total_checkins) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">{summary?.late_count || 0} late arrivals</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>Team mood over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ mood, percentage }) => `${mood} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {moodData.map((entry, index) => (
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
                <CardTitle>Attendance Status</CardTitle>
                <CardDescription>Breakdown of attendance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Present</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${summary ? (summary.present_count / summary.total_checkins) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary?.present_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Late</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{
                            width: `${summary ? (summary.late_count / summary.total_checkins) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary?.late_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Work From Home</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${summary ? (summary.wfh_count / summary.total_checkins) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary?.wfh_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Leave</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${summary ? (summary.leave_count / summary.total_checkins) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary?.leave_count || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Daily Trends</CardTitle>
              <CardDescription>Check-in patterns and productivity trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="checkin_date" tickFormatter={(value) => format(new Date(value), "MMM d")} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip labelFormatter={(value) => format(new Date(value), "EEEE, MMM d, yyyy")} />
                  <Bar yAxisId="left" dataKey="checkins" fill="#8884d8" name="Check-ins" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avg_productivity"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Avg Productivity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Individual team member performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <Badge variant="secondary">{user.role}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Last check-in: {user.last_checkin ? format(new Date(user.last_checkin), "MMM d") : "Never"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{user.total_checkins}</p>
                        <p className="text-xs text-muted-foreground">Check-ins</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getPerformanceColor(user.avg_productivity)}`}>
                          {user.avg_productivity ? user.avg_productivity.toFixed(1) : "0"}/10
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Productivity</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {getAttendanceRate(user.present_days, user.total_checkins)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{user.avg_hours ? user.avg_hours.toFixed(1) : "0"}h</p>
                        <p className="text-xs text-muted-foreground">Avg Hours</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-4 text-sm">
                      <span className="text-green-600">Present: {user.present_days}</span>
                      <span className="text-yellow-600">Late: {user.late_days}</span>
                      <span className="text-red-600">Leave: {user.leave_days}</span>
                      {user.total_overtime > 0 && (
                        <span className="text-blue-600">Overtime: {user.total_overtime}h</span>
                      )}
                    </div>
                  </div>
                ))}

                {userData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team performance data available for the selected period.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
