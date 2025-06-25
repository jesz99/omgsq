"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  FileText,
  Loader2,
  Edit,
  Trash2,
  Paperclip,
  Play,
} from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"

interface Task {
  id: number
  title: string
  description: string
  task_category: "CASE" | "HARIAN"
  status: string
  priority: string
  due_date: string
  user_deadline: string
  progress_percentage: number
  estimated_hours: number
  completed_hours: number
  is_personal: boolean
  client_name?: string
  assigned_to_name: string
  subtask_count: number
  completed_subtasks: number
  attachment_count: number
  subtasks?: any[]
  attachments?: any[]
  comments?: any[]
}

interface NewSubtask {
  title: string
  description: string
  priority: string
  due_date: string
  estimated_hours: string
}

export default function TaskManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const { masterData, loading: masterDataLoading } = useMasterData()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreating, setIsCreating] = useState(false)

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    task_category: "HARIAN" as "CASE" | "HARIAN",
    priority: "Medium",
    client_id: "",
    due_date: "",
    user_deadline: "",
    estimated_hours: "1",
    is_personal: false,
    subtasks: [] as NewSubtask[],
  })

  const [newSubtask, setNewSubtask] = useState<NewSubtask>({
    title: "",
    description: "",
    priority: "Medium",
    due_date: "",
    estimated_hours: "1",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/"
    } else if (user && ["team_member", "team_leader"].includes(user.role)) {
      loadTasks()
    }
  }, [user, authLoading])

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/tasks-enhanced?include_subtasks=true&include_attachments=true")
      const result = await response.json()

      if (result.success) {
        setTasks(result.tasks)
      } else {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.task_category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/tasks-enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          estimated_hours: Number.parseFloat(newTask.estimated_hours),
          client_id: newTask.client_id || null,
          assigned_to: user?.id,
        }),
      })

      const result = await response.json()
      if (result.success) {
        await loadTasks()
        setNewTask({
          title: "",
          description: "",
          task_category: "HARIAN",
          priority: "Medium",
          client_id: "",
          due_date: "",
          user_deadline: "",
          estimated_hours: "1",
          is_personal: false,
          subtasks: [],
        })
        setIsCreateTaskOpen(false)
        toast({
          title: "Success",
          description: "Task created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create task:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/api/tasks-enhanced/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await loadTasks()
        toast({
          title: "Success",
          description: `Task status updated to ${status}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProgress = async (taskId: number, progress: number) => {
    try {
      const response = await fetch(`/api/tasks-enhanced/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress_percentage: progress }),
      })

      if (response.ok) {
        await loadTasks()
        toast({
          title: "Success",
          description: "Progress updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update progress",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    }
  }

  const addSubtaskToNewTask = () => {
    if (!newSubtask.title) {
      toast({
        title: "Error",
        description: "Please enter a subtask title",
        variant: "destructive",
      })
      return
    }

    setNewTask((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { ...newSubtask }],
    }))

    setNewSubtask({
      title: "",
      description: "",
      priority: "Medium",
      due_date: "",
      estimated_hours: "1",
    })

    toast({
      title: "Success",
      description: "Subtask added to task",
    })
  }

  const removeSubtaskFromNewTask = (index: number) => {
    setNewTask((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }))
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      Pending: "bg-gray-100 text-gray-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Overdue: "bg-red-100 text-red-800",
      Cancelled: "bg-red-100 text-red-800",
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

  const getCategoryBadge = (category: "CASE" | "HARIAN") => {
    const colors = {
      CASE: "bg-purple-100 text-purple-800",
      HARIAN: "bg-blue-100 text-blue-800",
    }
    return <Badge className={colors[category]}>{category}</Badge>
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || task.task_category === categoryFilter
    const matchesStatus = statusFilter === "all" || task.status.toLowerCase().replace(" ", "") === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getTaskStats = () => {
    return {
      total: tasks.length,
      case: tasks.filter((t) => t.task_category === "CASE").length,
      harian: tasks.filter((t) => t.task_category === "HARIAN").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      pending: tasks.filter((t) => t.status === "Pending").length,
      avgProgress:
        tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress_percentage, 0) / tasks.length) : 0,
    }
  }

  if (loading || authLoading || masterDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading task management...</p>
        </div>
      </div>
    )
  }

  if (!user || !["team_member", "team_leader"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">Only team members and team leaders can access task management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getTaskStats()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Manage your tasks, subtasks, and track progress</p>
          </div>
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Create a new task with subtasks and details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title *</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newTask.task_category}
                      onValueChange={(value: "CASE" | "HARIAN") => setNewTask({ ...newTask, task_category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASE">CASE</SelectItem>
                        <SelectItem value="HARIAN">HARIAN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* {newTask.task_category === "CASE" && (
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                      value={newTask.client_id}
                      onValueChange={(value) => setNewTask({ ...newTask, client_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {masterData.clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )} */}

                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={newTask.client_id}
                    onValueChange={(value) => setNewTask({ ...newTask, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="userDeadline">My Deadline</Label>
                    <Input
                      id="userDeadline"
                      type="date"
                      value={newTask.user_deadline}
                      onChange={(e) => setNewTask({ ...newTask, user_deadline: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="estimatedHours">Est. Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      step="0.5"
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask({ ...newTask, estimated_hours: e.target.value })}
                      placeholder="Hours"
                    />
                  </div>
                </div>

                {/* Subtasks Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Subtasks</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSubtaskToNewTask}
                      disabled={!newSubtask.title}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subtask
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Subtask title"
                      value={newSubtask.title}
                      onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                    />
                    <Select
                      value={newSubtask.priority}
                      onValueChange={(value) => setNewSubtask({ ...newSubtask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newTask.subtasks.length > 0 && (
                    <div className="space-y-2">
                      {newTask.subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{subtask.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {subtask.priority}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubtaskFromNewTask(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.task_category || isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-6">
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
              <CardTitle className="text-sm font-medium">CASE Tasks</CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.case}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HARIAN Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.harian}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
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
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="CASE">CASE</SelectItem>
                  <SelectItem value="HARIAN">HARIAN</SelectItem>
                </SelectContent>
              </Select>

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
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      {getCategoryBadge(task.task_category)}
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>

                    <p className="text-muted-foreground mb-3">{task.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Due: {task.user_deadline || task.due_date || "Not set"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {task.completed_hours}h / {task.estimated_hours}h
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Subtasks: {task.completed_subtasks}/{task.subtask_count}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Files: {task.attachment_count}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{task.progress_percentage}%</span>
                      </div>
                      <Progress value={task.progress_percentage} className="h-2" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task)
                        setIsTaskDetailOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Details
                    </Button>

                    {task.status === "Pending" && (
                      <Button size="sm" onClick={() => handleUpdateTaskStatus(task.id, "In Progress")}>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}

                    {task.status === "In Progress" && (
                      <Button size="sm" onClick={() => handleUpdateTaskStatus(task.id, "Completed")}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first task to get started"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
