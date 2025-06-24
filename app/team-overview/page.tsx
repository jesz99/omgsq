"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, TrendingUp, Target, Clock, Loader2, Star, Award, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function TeamOverviewPage() {
  const { user } = useAuth()
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    } else if (user) {
      loadTeamOverview()
    }
  }, [user, loading])

  const loadTeamOverview = async () => {
    try {
      const response = await apiClient.getTeamOverview()
      if (response.success) {
        setTeamData(response)
      }
    } catch (error) {
      console.error("Failed to load team overview:", error)
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

  // Use teamData instead of hardcoded data
  const teams = teamData?.teams || []
  const teamMembers = teamData?.teamMembers || []
  const performanceData = teamData?.performanceData || []

  const getStatusBadge = (status: string) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      Busy: "bg-yellow-100 text-yellow-800",
      Offline: "bg-gray-100 text-gray-800",
    }
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Overview</h1>
            <p className="text-muted-foreground">Complete view of all teams and their performance</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">Active teams</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.members, 0)}</div>
              <p className="text-xs text-muted-foreground">Across all teams</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(teams.reduce((sum, team) => sum + team.performance, 0) / teams.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Company average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${teams.reduce((sum, team) => sum + team.revenue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList>
            <TabsTrigger value="teams">Team Performance</TabsTrigger>
            <TabsTrigger value="members">Individual Members</TabsTrigger>
            <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {team.name}
                          {team.performance >= 95 && <Star className="h-4 w-4 text-yellow-500" />}
                          {team.performance >= 90 && team.performance < 95 && (
                            <Award className="h-4 w-4 text-blue-500" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          Led by {team.leader} • {team.members} members
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPerformanceColor(team.performance)}`}>
                          {team.performance}%
                        </div>
                        <p className="text-xs text-muted-foreground">Performance</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Revenue</span>
                          <span className="font-medium">${team.revenue.toLocaleString()}</span>
                        </div>
                        <Progress value={(team.revenue / 50000) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Clients</span>
                          <span className="font-medium">{team.clients}</span>
                        </div>
                        <Progress value={(team.clients / 30) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Efficiency</span>
                          <span className="font-medium">{team.efficiency}%</span>
                        </div>
                        <Progress value={team.efficiency} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Satisfaction</span>
                          <span className="font-medium">{team.satisfaction}/5</span>
                        </div>
                        <Progress value={(team.satisfaction / 5) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Individual performance across all teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/placeholder-user-${member.id}.jpg`} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {member.role} • {member.team}
                          </p>
                          <p className="text-xs text-muted-foreground">Last active: {member.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{member.clients}</p>
                          <p className="text-xs text-muted-foreground">Clients</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">${member.revenue.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-medium ${getPerformanceColor(member.performance)}`}>
                            {member.performance}%
                          </p>
                          <p className="text-xs text-muted-foreground">Performance</p>
                        </div>
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance Comparison</CardTitle>
                  <CardDescription>Performance metrics across teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="team" />
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
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Revenue contribution by team (in thousands)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="team" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#f59e0b" name="Revenue (K)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Highest performing team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers
                      .sort((a, b) => b.performance - a.performance)
                      .slice(0, 3)
                      .map((member, index) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.team}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">{member.performance}%</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Insights</CardTitle>
                  <CardDescription>Key observations and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Team Gamma leads efficiency</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">96% efficiency rate</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Revenue growth trend</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">+15% across all teams</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Avg response time</span>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">4.2 hours to clients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                  <CardDescription>Areas requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Team Beta support needed</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">Performance below target</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Resource allocation</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">Consider team rebalancing</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Training opportunity</span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">Skills development program</p>
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
