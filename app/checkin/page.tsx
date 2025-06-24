"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"
import { Clock, MapPin, Smile, TrendingUp, Calendar, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface CheckIn {
  id: number
  checkin_date: string
  start_time: string
  end_time?: string
  status: string
  mood: string
  productivity_level: number
  tasks_planned: string
  tasks_completed: string
  challenges_faced: string
  support_needed: string
  notes: string
  location: string
  total_hours: number
  break_hours: number
  overtime_hours: number
}

export default function CheckInPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [todayCheckin, setTodayCheckin] = useState<CheckIn | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([])
  const [formData, setFormData] = useState({
    checkin_date: format(new Date(), "yyyy-MM-dd"),
    start_time: format(new Date(), "HH:mm"),
    end_time: "",
    status: "Present",
    mood: "Good",
    productivity_level: 5,
    tasks_planned: "",
    tasks_completed: "",
    challenges_faced: "",
    support_needed: "",
    notes: "",
    location: "Office",
    total_hours: 8,
    break_hours: 1,
    overtime_hours: 0,
  })

  useEffect(() => {
    if (user && ["Team Member", "Team Leader"].includes(user.role)) {
      fetchTodayCheckin()
      fetchRecentCheckins()
    }
  }, [user])

  const fetchTodayCheckin = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const response = await apiClient.get(`/api/checkins?date=${today}`)
      if (response.checkins && response.checkins.length > 0) {
        setTodayCheckin(response.checkins[0])
        setFormData({
          ...response.checkins[0],
          checkin_date: response.checkins[0].checkin_date,
          start_time: response.checkins[0].start_time,
          end_time: response.checkins[0].end_time || "",
        })
      }
    } catch (error) {
      console.error("Error fetching today checkin:", error)
    }
  }

  const fetchRecentCheckins = async () => {
    try {
      const response = await apiClient.get("/api/checkins")
      setRecentCheckins(response.checkins || [])
    } catch (error) {
      console.error("Error fetching recent checkins:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (todayCheckin) {
        await apiClient.put(`/api/checkins/${todayCheckin.id}`, formData)
      } else {
        await apiClient.post("/api/checkins", formData)
      }

      await fetchTodayCheckin()
      await fetchRecentCheckins()
    } catch (error) {
      console.error("Error saving check-in:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Present: "bg-green-100 text-green-800",
      Late: "bg-yellow-100 text-yellow-800",
      "Half Day": "bg-blue-100 text-blue-800",
      "Work From Home": "bg-purple-100 text-purple-800",
      "Sick Leave": "bg-red-100 text-red-800",
      "Personal Leave": "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      Excellent: "😄",
      Good: "😊",
      Average: "😐",
      Poor: "😞",
      Stressed: "😰",
    }
    return emojis[mood as keyof typeof emojis] || "😐"
  }

  // if (!user || !["Team Member", "Team Leader"].includes(user.role)) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[400px]">
  //       <Card className="w-full max-w-md">
  //         <CardHeader>
  //           <CardTitle>Access Denied</CardTitle>
  //           <CardDescription>Daily check-in is only available for team members and team leaders.</CardDescription>
  //         </CardHeader>
  //       </Card>
  //     </div>
  //   )
  // }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Check-in</h1>
          <p className="text-muted-foreground">Record your daily work status and activities</p>
        </div>

        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList>
            <TabsTrigger value="checkin">Today's Check-in</TabsTrigger>
            <TabsTrigger value="history">Check-in History</TabsTrigger>
          </TabsList>

          <TabsContent value="checkin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {todayCheckin ? "Update Today's Check-in" : "Daily Check-in"}
                </CardTitle>
                <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Present">Present</SelectItem>
                          <SelectItem value="Late">Late</SelectItem>
                          <SelectItem value="Half Day">Half Day</SelectItem>
                          <SelectItem value="Work From Home">Work From Home</SelectItem>
                          <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                          <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mood">Mood</Label>
                      <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">😄 Excellent</SelectItem>
                          <SelectItem value="Good">😊 Good</SelectItem>
                          <SelectItem value="Average">😐 Average</SelectItem>
                          <SelectItem value="Poor">😞 Poor</SelectItem>
                          <SelectItem value="Stressed">😰 Stressed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Client Site">Client Site</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productivity_level">Productivity Level (1-10)</Label>
                    <Input
                      id="productivity_level"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.productivity_level}
                      onChange={(e) => setFormData({ ...formData, productivity_level: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="total_hours">Total Hours</Label>
                      <Input
                        id="total_hours"
                        type="number"
                        step="0.5"
                        value={formData.total_hours}
                        onChange={(e) => setFormData({ ...formData, total_hours: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="break_hours">Break Hours</Label>
                      <Input
                        id="break_hours"
                        type="number"
                        step="0.5"
                        value={formData.break_hours}
                        onChange={(e) => setFormData({ ...formData, break_hours: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overtime_hours">Overtime Hours</Label>
                      <Input
                        id="overtime_hours"
                        type="number"
                        step="0.5"
                        value={formData.overtime_hours}
                        onChange={(e) => setFormData({ ...formData, overtime_hours: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tasks_planned">Tasks Planned</Label>
                    <Textarea
                      id="tasks_planned"
                      value={formData.tasks_planned}
                      onChange={(e) => setFormData({ ...formData, tasks_planned: e.target.value })}
                      placeholder="What tasks do you plan to work on today?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tasks_completed">Tasks Completed</Label>
                    <Textarea
                      id="tasks_completed"
                      value={formData.tasks_completed}
                      onChange={(e) => setFormData({ ...formData, tasks_completed: e.target.value })}
                      placeholder="What tasks did you complete?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="challenges_faced">Challenges Faced</Label>
                    <Textarea
                      id="challenges_faced"
                      value={formData.challenges_faced}
                      onChange={(e) => setFormData({ ...formData, challenges_faced: e.target.value })}
                      placeholder="Any challenges or obstacles you encountered?"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support_needed">Support Needed</Label>
                    <Textarea
                      id="support_needed"
                      value={formData.support_needed}
                      onChange={(e) => setFormData({ ...formData, support_needed: e.target.value })}
                      placeholder="Do you need any support or assistance?"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes or comments?"
                      rows={2}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : todayCheckin ? "Update Check-in" : "Submit Check-in"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Check-in History</CardTitle>
                <CardDescription>Your recent daily check-ins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCheckins.map((checkin) => (
                    <div key={checkin.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(checkin.checkin_date), "EEEE, MMM d, yyyy")}
                          </span>
                        </div>
                        <Badge className={getStatusColor(checkin.status)}>{checkin.status}</Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {checkin.start_time} - {checkin.end_time || "Ongoing"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{checkin.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smile className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {getMoodEmoji(checkin.mood)} {checkin.mood}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>Productivity: {checkin.productivity_level}/10</span>
                        </div>
                      </div>

                      {checkin.tasks_completed && (
                        <div className="mt-3 p-3 bg-green-50 rounded-md">
                          <h4 className="font-medium text-green-800 mb-1">Tasks Completed:</h4>
                          <p className="text-green-700 text-sm">{checkin.tasks_completed}</p>
                        </div>
                      )}

                      {checkin.challenges_faced && (
                        <div className="mt-2 p-3 bg-yellow-50 rounded-md">
                          <h4 className="font-medium text-yellow-800 mb-1">Challenges:</h4>
                          <p className="text-yellow-700 text-sm">{checkin.challenges_faced}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {recentCheckins.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No check-ins found. Start by submitting your first daily check-in!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
