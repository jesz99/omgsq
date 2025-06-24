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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Calendar, Clock, CheckCircle, AlertTriangle, User, FileText, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useMasterData } from "@/hooks/use-master-data"

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth()
  const { masterData, loading: masterDataLoading } = useMasterData()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    client: "",
    priority: "",
    dueDate: "",
    category: "",
    estimatedHours: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    } else if (user) {
      loadTasks()
    }
  }, [user, loading])

  const loadTasks = async () => {
    try {
      const response = await apiClient.getTasks()
      if (response.success) {
        const formattedTasks = response.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          client: task.client_name || "No Client",
          priority: task.priority,
          status: task.status,
          dueDate: task.due_date,
          assignedBy: task.assigned_by_name,
          category: task.category,
          estimatedHours: task.estimated_hours,
          completedHours: task.completed_hours,
        }))
        setTasks(formattedTasks)
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status.toLowerCase().replace(" ", "") === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority.toLowerCase() === priorityFilter)
    }

    setFilteredTasks(filtered)
  }, [searchTerm, statusFilter, priorityFilter, tasks])

  if (loading || authLoading || masterDataLoading) {
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

  const handleCreateTask = async () => {
    if (newTask.title && newTask.client && newTask.priority && newTask.dueDate) {
      try {
        const response = await apiClient.createTask({
          title: newTask.title,
          description: newTask.description,
          client_id: newTask.client, // This should be client ID
          priority: newTask.priority,
          category: newTask.category,
          due_date: newTask.dueDate,
          estimated_hours: Number.parseInt(newTask.estimatedHours) || 1,
          assigned_to: user.id, // Assign to current user for now
        })

        if (response.success) {
          await loadTasks() // Reload tasks
          setNewTask({
            title: "",
            description: "",
            client: "",
            priority: "",
            dueDate: "",
            category: "",
            estimatedHours: "",
          })
          setIsCreateTaskOpen(false)
        }
      } catch (error) {
        console.error("Failed to create task:", error)
      }
    }
  }

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const response = await apiClient.updateTaskStatus(taskId.toString(), newStatus)
      if (response.success) {
        await loadTasks() // Reload tasks
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      Pending: "bg-gray-100 text-gray-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Scheduled: "bg-purple-100 text-purple-800",
      Overdue: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      Critical: "bg-red-100 text-red-800",
      High: "bg-orange-100 text-orange-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    }
    return <Badge className={colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{priority}</Badge>
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      "Client Management": User,
      Reporting: FileText,
      Documentation: FileText,
      Meeting: Calendar,
      Collections: AlertTriangle,
    }
    const Icon = icons[category as keyof typeof icons] || FileText
    return <Icon className="h-4 w-4" />
  }

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "Pending").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      overdue: tasks.filter((t) => t.status === "Overdue").length,
      totalHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      completedHours: tasks.reduce((sum, t) => sum + t.completedHours, 0),
    }
  }

  const stats = getTaskStats()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">Manage your assigned tasks and deadlines</p>
          </div>
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to your workflow.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select value={newTask.client} onValueChange={(value) => setNewTask({ ...newTask, client: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {masterData.priorities.map((priority) => (
                          <SelectItem key={priority.id} value={priority.name}>
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {masterData.taskCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                      placeholder="Hours"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateTask}>
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedHours}/{stats.totalHours}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(stats.completedHours / stats.totalHours) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>All your assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={task.status === "Completed"}
                          onCheckedChange={(checked) => updateTaskStatus(task.id, checked ? "Completed" : "Pending")}
                        />
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(task.category)}
                          <div>
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {task.client}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Assigned by {task.assignedBy}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{task.dueDate}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {task.completedHours}/{task.estimatedHours}h
                          </p>
                        </div>
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                        <div className="flex items-center space-x-2">
                          {task.status === "Pending" && (
                            <Button size="sm" onClick={() => updateTaskStatus(task.id, "In Progress")}>
                              Start
                            </Button>
                          )}
                          {task.status === "In Progress" && (
                            <Button size="sm" onClick={() => updateTaskStatus(task.id, "Completed")}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {["pending", "inprogress", "overdue", "completed"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{status.replace("inprogress", "In Progress")} Tasks</CardTitle>
                  <CardDescription>Tasks with {status.replace("inprogress", "in progress")} status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks
                      .filter((task) => task.status.toLowerCase().replace(" ", "") === status)
                      .map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Checkbox
                              checked={task.status === "Completed"}
                              onCheckedChange={(checked) =>
                                updateTaskStatus(task.id, checked ? "Completed" : "Pending")
                              }
                            />
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(task.category)}
                              <div>
                                <h4 className="font-semibold">{task.title}</h4>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {task.client}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{task.dueDate}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {task.completedHours}/{task.estimatedHours}h
                              </p>
                            </div>
                            {getPriorityBadge(task.priority)}
                            <div className="flex items-center space-x-2">
                              {task.status === "Pending" && (
                                <Button size="sm" onClick={() => updateTaskStatus(task.id, "In Progress")}>
                                  Start
                                </Button>
                              )}
                              {task.status === "In Progress" && (
                                <Button size="sm" onClick={() => updateTaskStatus(task.id, "Completed")}>
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
