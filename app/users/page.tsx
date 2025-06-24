"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserPlus, Edit, Trash2, Search, Loader2, RefreshCw } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { apiClient } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  phone?: string
  address?: string
  join_date: string
  team_leader_id?: string
  team_leader_name?: string
  team_members_count?: number
}

export default function UsersPage() {
  const { user, loading } = useAuth()
  const { masterData, loading: masterDataLoading } = useMasterData()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [teamLeaders, setTeamLeaders] = useState<User[]>([])

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    address: "",
    team_leader_id: "",
    status: "active",
  })

  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    address: "",
    team_leader_id: "",
    status: "active",
  })

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    }
  }, [user, loading])

  useEffect(() => {
    if (user && !loading) {
      fetchUsers()
    }
  }, [user, loading])

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getUsers()
      if (response.success) {
        setUsers(response.users)
        // Filter team leaders for dropdown
        const leaders = response.users.filter((u: User) => u.role === "team_leader" && u.status === "active")
        setTeamLeaders(leaders)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await apiClient.createUser(newUser)
      if (response.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        })
        setNewUser({
          name: "",
          email: "",
          password: "",
          phone: "",
          role: "",
          address: "",
          team_leader_id: "",
          status: "active",
        })
        setIsAddUserOpen(false)
        fetchUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: User) => {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "", // Don't pre-fill password
      phone: user.phone || "",
      role: user.role,
      address: user.address || "",
      team_leader_id: user.team_leader_id || "",
      status: user.status,
    })
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editUser.name || !editUser.email || !editUser.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await apiClient.updateUser(editUser.id, editUser)
      if (response.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        setIsEditUserOpen(false)
        fetchUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await apiClient.deleteUser(userId)
      if (response.success) {
        toast({
          title: "Success",
          description: "User deactivated successfully",
        })
        fetchUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  if (loading || masterDataLoading) {
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

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      team_leader: "bg-blue-100 text-blue-800",
      team_member: "bg-green-100 text-green-800",
      finance: "bg-yellow-100 text-yellow-800",
      director: "bg-red-100 text-red-800",
    }
    const displayName = role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")
    return <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{displayName}</Badge>
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage team members and their roles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {user.role === "admin" && (
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account and assign their role.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterData.userRoles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name.charAt(0).toUpperCase() + role.name.slice(1).replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newUser.role === "team_member" && (
                      <div className="grid gap-2">
                        <Label htmlFor="team_leader">Team Leader</Label>
                        <Select
                          value={newUser.team_leader_id}
                          onValueChange={(value) => setNewUser({ ...newUser, team_leader_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team leader" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Team Leader</SelectItem>
                            {teamLeaders.map((leader) => (
                              <SelectItem key={leader.id} value={leader.id}>
                                {leader.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={newUser.address}
                        onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                        placeholder="Enter address"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddUser}>
                      Add User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Team Leader</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photo_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                        {user.team_members_count && user.team_members_count > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {user.team_members_count} team member{user.team_members_count > 1 ? "s" : ""}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.team_leader_name ? (
                          <span className="text-sm">{user.team_leader_name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.join_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {(user.role === "admin" || user.role === "director") && (
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {user.role === "admin" && user.id !== user.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will deactivate the user account. The user will no longer be able to access the
                                    system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Deactivate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and settings.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editUser.phone}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterData.userRoles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1).replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editUser.role === "team_member" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-team-leader">Team Leader</Label>
                  <Select
                    value={editUser.team_leader_id}
                    onValueChange={(value) => setEditUser({ ...editUser, team_leader_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team leader" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Team Leader</SelectItem>
                      {teamLeaders.map((leader) => (
                        <SelectItem key={leader.id} value={leader.id}>
                          {leader.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editUser.status} onValueChange={(value) => setEditUser({ ...editUser, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editUser.address}
                  onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateUser}>
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
