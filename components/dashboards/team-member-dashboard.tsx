"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UserCheck, FileText, Clock, CheckCircle, Plus, Calendar } from "lucide-react"

export function TeamMemberDashboard() {
  const stats = [
    { title: "My Clients", value: "18", icon: UserCheck, change: "+2 this month" },
    { title: "Active Tasks", value: "7", icon: FileText, change: "3 due this week" },
    { title: "Completed", value: "24", icon: CheckCircle, change: "This month" },
    { title: "Pending Review", value: "3", icon: Clock, change: "Awaiting approval" },
  ]

  const recentClients = [
    { name: "ABC Corporation", category: "Monthly", lastUpdate: "2 days ago", status: "Active" },
    { name: "XYZ Industries", category: "Yearly", lastUpdate: "1 week ago", status: "Pending" },
    { name: "Tech Solutions", category: "As per case", lastUpdate: "3 days ago", status: "Active" },
  ]

  const upcomingTasks = [
    { task: "Update client profile - ABC Corp", dueDate: "Today", priority: "High" },
    { task: "Prepare monthly report - XYZ Industries", dueDate: "Tomorrow", priority: "Medium" },
    { task: "Follow up on documentation", dueDate: "Jan 20", priority: "Low" },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your clients and tasks</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
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
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
            <CardDescription>Your performance this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Client Updates</span>
                  <span>24/30</span>
                </div>
                <Progress value={80} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Task Completion</span>
                  <span>18/25</span>
                </div>
                <Progress value={72} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Documentation</span>
                  <span>12/15</span>
                </div>
                <Progress value={80} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
