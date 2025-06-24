"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Edit, Users, Target, TrendingUp, Loader2, Settings, MessageSquare } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function TeamManagementPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    skills: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    } else if (user) {
      loadTeamMembers()
    }
  }, [user, loading])

  const loadTeamMembers = async () => {
    try {
      const response = await apiClient.getUsers()
      if (response.success) {
        // Filter to only show team members under current user's leadership
        const filteredMembers = response.users.filter(
          (u) => u.team_leader_id === user.id || user.role === "admin" || user.role === "director",
        )

        const formattedMembers = filteredMembers.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          performance: 85 + Math.floor(Math.random() * 15), // Random performance for demo
          clients: Math.floor(Math.random() * 15) + 5, // Random client count
          revenue: Math.floor(Math.random() * 10000) + 10000, // Random revenue
          status: member.status === "active" ? "Active" : "Offline",
          joinDate: member.join_date,
          lastActive: "1 hour ago", // Default last active
          skills: ["Tax Planning", "Client Support"], // Default skills
        }))
        setTeamMembers(formattedMembers)
      }
    } catch (error) {
      console.error("Failed to load team members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (newMember.name && newMember.email && newMember.role) {
      try {
        const response = await apiClient.createUser({
          name: newMember.name,
          email: newMember.email,
          password: "defaultpassword123", // Default password
          role: newMember.role,
          team_leader_id: user.id,
        })

        if (response.success) {
          await loadTeamMembers() // Reload team members
          setNewMember({ name: "", email: "", role: "", skills: "" })
          setIsAddMemberOpen(false)
        }
      } catch (error) {
        console.error("Failed to add team member:", error)
      }
    }
  }

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

  const teamStats = {
    totalMembers: teamMembers.length,
    avgPerformance: Math.round(teamMembers.reduce((sum, member) => sum + member.performance, 0) / teamMembers.length),
    totalRevenue: teamMembers.reduce((sum, member) => sum + member.revenue, 0),
    totalClients: teamMembers.reduce((sum, member) => sum + member.clients, 0),
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">Manage your team members and their performance</p>
          </div>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Add a new member to your team.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Consultant">Senior Consultant</SelectItem>
                      <SelectItem value="Tax Specialist">Tax Specialist</SelectItem>
                      <SelectItem value="Junior Consultant">Junior Consultant</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    value={newMember.skills}
                    onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                    placeholder="e.g., Tax Planning, Audit, Bookkeeping"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddMember}>
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(teamStats.avgPerformance)}`}>
                {teamStats.avgPerformance}%
              </div>
              <p className="text-xs text-muted-foreground">Team average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${teamStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Assigned clients</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team members and their assignments</CardDescription>
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
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {member.joinDate} • Last active: {member.lastActive}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
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
                    <div className="text-center min-w-[80px]">
                      <p className={`text-sm font-medium ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </p>
                      <Progress value={member.performance} className="w-16 h-2" />
                    </div>
                    {getStatusBadge(member.status)}
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
              <CardDescription>Team member performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Excellent (90%+)</span>
                  <Badge className="bg-green-100 text-green-800">
                    {teamMembers.filter((m) => m.performance >= 90).length} members
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Good (80-89%)</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {teamMembers.filter((m) => m.performance >= 80 && m.performance < 90).length} members
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Needs Improvement (&lt;80%)</span>
                  <Badge className="bg-red-100 text-red-800">
                    {teamMembers.filter((m) => m.performance < 80).length} members
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Actions</CardTitle>
              <CardDescription>Quick actions for team management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Schedule Team Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Set Performance Goals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Team Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Team Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
