"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Target, TrendingUp, AlertTriangle, UserPlus, BarChart3 } from "lucide-react"

export function TeamLeaderDashboard() {
  const stats = [
    { title: "Team Members", value: "8", icon: Users, change: "+1 this month" },
    { title: "Team Performance", value: "87%", icon: Target, change: "+5% from last month" },
    { title: "Active Clients", value: "64", icon: TrendingUp, change: "Across all members" },
    { title: "Overdue Tasks", value: "3", icon: AlertTriangle, change: "Needs attention" },
  ]

  const teamMembers = [
    { name: "John Doe", clients: 12, completion: 92, lastActive: "2 hours ago", status: "Active" },
    { name: "Jane Smith", clients: 8, completion: 88, lastActive: "1 day ago", status: "Active" },
    { name: "Mike Johnson", clients: 15, completion: 95, lastActive: "30 min ago", status: "Active" },
    { name: "Sarah Wilson", clients: 10, completion: 78, lastActive: "3 hours ago", status: "Busy" },
    { name: "Tom Brown", clients: 9, completion: 85, lastActive: "1 hour ago", status: "Active" },
  ]

  const teamTasks = [
    { member: "John Doe", task: "Client profile update", dueDate: "Today", status: "Overdue" },
    { member: "Jane Smith", task: "Monthly report preparation", dueDate: "Tomorrow", status: "In Progress" },
    { member: "Mike Johnson", task: "Documentation review", dueDate: "Jan 20", status: "Pending" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Busy":
        return <Badge className="bg-yellow-100 text-yellow-800">Busy</Badge>
      case "Overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "Pending":
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Leader Dashboard</h1>
          <p className="text-muted-foreground">Manage your team and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
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
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Individual member performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/placeholder-user-${index + 1}.jpg`} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.clients} clients • {member.lastActive}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.completion}%</p>
                      <Progress value={member.completion} className="w-16 h-2" />
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Tasks Overview</CardTitle>
            <CardDescription>Current tasks and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamTasks.map((task, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">
                      Assigned to {task.member} • Due {task.dueDate}
                    </p>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Insights</CardTitle>
          <CardDescription>Key metrics and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Top Performer</h4>
              <p className="text-sm text-green-600">Mike Johnson - 95% completion rate</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Needs Support</h4>
              <p className="text-sm text-yellow-600">Sarah Wilson - Consider additional training</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Team Average</h4>
              <p className="text-sm text-blue-600">87% completion rate this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
