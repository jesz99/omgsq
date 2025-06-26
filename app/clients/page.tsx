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
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Edit, Search, Calendar, Loader2, Trash2, X, RefreshCw } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { toast } from "@/components/ui/use-toast"

export default function ClientsPage() {
  const { user, loading } = useAuth()
  const { masterData, loading: masterDataLoading } = useMasterData()
  const [clients, setClients] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [newClient, setNewClient] = useState({
    name: "",
    pic_name: "",
    pic_phone: "",
    tax_id: "",
    category: "",
    address: "",
    notes: "",
    assigned_to: "",
    recurring_due_date: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    }
    fetchTeamMembers()
  }, [user, loading])

  
  const fetchTeamMembers = async () => {
    setLoadingMembers(true)
    try {
      const response = await fetch("/api/users", {
        credentials: "include",
      })
      const data = await response.json()
      console.log(data)

      if (data.success) {
        // Filter for active team members and team leaders only
        const activeMembers = data.users.filter(
          (user) => ["team_member", "team_leader"].includes(user.role) && user.status === "active",
        )
        setTeamMembers(activeMembers)
        console.log("Fetched team members:", activeMembers)
      } else {
        console.error("Failed to fetch users:", data.error)
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      })
    } finally {
      setLoadingMembers(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients", {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setClients(data.clients)
      } else {
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchTeamMembers()
    fetchClients()
  }, [])

  
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()

    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await response.json()
      if (data.success) {
        setUploadedFiles([...uploadedFiles, ...data.files])
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Upload failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const handleAddClient = async () => {

    // Validation
    if (!newClient.name || !newClient.pic_name || !newClient.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Client Name, PIC Name, and Category",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const clientData = {
        ...newClient,
        assigned_to: newClient.assigned_to || null,
        recurring_due_date: newClient.recurring_due_date || null,
        files: uploadedFiles,
      }

      console.log("Sending client data:", clientData)

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(clientData),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        // Reset form
        setNewClient({
          name: "",
          pic_name: "",
          pic_phone: "",
          tax_id: "",
          category: "",
          address: "",
          notes: "",
          assigned_to: "",
          recurring_due_date: "",
        })
        setUploadedFiles([])
        setIsAddClientOpen(false)

        // Refresh clients list
        await fetchClients()

        toast({
          title: "Success",
          description: data.message || "Client created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create client",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating client:", error)
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClient = (client) => {
    setEditingClient({
      ...client,
      pic_name: client.pic_name || client.picName,
      pic_phone: client.pic_phone || client.picPhone,
      tax_id: client.tax_id || client.taxId,
      assigned_to: client.assigned_to?.toString() || "",
      recurring_due_date: client.recurring_due_date,
    })
    setIsEditClientOpen(true)
  }


  const handleUpdateClient = async () => {
    console.log("Update client button clicked")
    console.log("Editing client data:", editingClient)

    if (!editingClient.name || !editingClient.pic_name || !editingClient.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Client Name, PIC Name, and Category",
        variant: "destructive",
      })
      return
    }

    if (!editingClient.id) {
      toast({
        title: "Error",
        description: "Client ID is missing",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)

    try {
      const updateData = {
        ...editingClient,
        assigned_to: editingClient.assigned_to || null,
        recurring_due_date: editingClient.recurring_due_date || null,
      }

      console.log("Sending update data:", updateData)
      console.log("Client ID:", editingClient.id)

      const response = await fetch(`/api/clients/${editingClient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      })

      console.log("Update response status:", response.status)
      console.log("Update response URL:", response.url)

      const data = await response.json()
      console.log("Update response data:", data)

      if (data.success) {
        await fetchClients()
        setIsEditClientOpen(false)
        setEditingClient(null)
        toast({
          title: "Success",
          description: data.message || "Client updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update client",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteClient = async (clientId) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()
      if (data.success) {
        fetchClients()
        toast({
          title: "Success",
          description: "Client deactivated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete client",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
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

  const getCategoryBadge = (category) => {
    const colors = {
      Monthly: "bg-blue-100 text-blue-800",
      Yearly: "bg-green-100 text-green-800",
      "As per case": "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>
  }

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    )
  }

  // Filter clients based on search and category
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.pic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.tax_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || client.category.toLowerCase() === categoryFilter.toLowerCase()

    return matchesSearch && matchesCategory
  })

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Daftar Klien</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTeamMembers} disabled={loadingMembers}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loadingMembers ? "animate-spin" : ""}`} />
              Refresh Members
            </Button>
            <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tambah Klien
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Tambah Klien Baru</DialogTitle>
                  <DialogDescription>Buat profil klien baru</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="clientName">Nama Klien *</Label>
                      <Input
                        id="clientName"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="Enter client company name"
                        disabled={submitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="picName">Nama PIC Klien *</Label>
                      <Input
                        id="picName"
                        value={newClient.pic_name}
                        onChange={(e) => setNewClient({ ...newClient, pic_name: e.target.value })}
                        placeholder="Person in charge name"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="picPhone">No HP</Label>
                      <Input
                        id="picPhone"
                        value={newClient.pic_phone}
                        onChange={(e) => setNewClient({ ...newClient, pic_phone: e.target.value })}
                        placeholder="Person in charge phone number"
                        disabled={submitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="taxId">No NPWP</Label>
                      <Input
                        id="taxId"
                        value={newClient.tax_id}
                        onChange={(e) => setNewClient({ ...newClient, tax_id: e.target.value })}
                        placeholder="Tax identification number"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori *</Label>
                      <Select
                        value={newClient.category}
                        onValueChange={(value) => setNewClient({ ...newClient, category: value })}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterData?.clientCategories?.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="assignedTo">
                        Assigned To {loadingMembers && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
                      </Label>
                      <Select
                        value={newClient.assigned_to}
                        onValueChange={(value) => setNewClient({ ...newClient, assigned_to: value })}
                        disabled={loadingMembers || submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingMembers ? "Loading..." : "Select team member"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="recurringDueDate">Recurring Due Date</Label>
                    <Input
                        id="recurringDueDate"
                        value={newClient.recurring_due_date}
                        onChange={(e) => setNewClient({ ...newClient, recurring_due_date: e.target.value })}
                        placeholder="Tanggal Penagihan"
                        disabled={submitting}
                      />
                    {/* <Input
                      id="recurringDueDate"
                      type="date"
                      value={newClient.recurring_due_date}
                      onChange={(e) => setNewClient({ ...newClient, recurring_due_date: e.target.value })}
                    /> */}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      placeholder="Client address"
                      rows={3}
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newClient.notes}
                      onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                      placeholder="Additional notes or tags"
                      rows={2}
                      disabled={submitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="files">Upload Files (Max 2MB each)</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id="files"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.png,.xlsx,.xls"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          disabled={uploading || submitting}
                        />
                        {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Uploaded Files:</Label>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                              <span>
                                {file.originalName} ({(file.size / 1024).toFixed(1)} KB)
                              </span> 
                              <Button variant="ghost" size="sm" onClick={() => removeUploadedFile(index)} disabled={submitting}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddClient} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Tambah Klien"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Client Dialog */}
        <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update client information.</DialogDescription>
            </DialogHeader>
            {editingClient && (
              <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editClientName">Client Name *</Label>
                    <Input
                      id="editClientName"
                      value={editingClient.name}
                      onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                      placeholder="Enter client company name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editPicName">PIC Name *</Label>
                    <Input
                      id="editPicName"
                      value={editingClient.pic_name}
                      onChange={(e) => setEditingClient({ ...editingClient, pic_name: e.target.value })}
                      placeholder="Person in charge name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editPicPhone">PIC Phone</Label>
                    <Input
                      id="editPicPhone"
                      value={editingClient.pic_phone}
                      onChange={(e) => setEditingClient({ ...editingClient, pic_phone: e.target.value })}
                      placeholder="Person in charge phone number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editTaxId">Tax ID</Label>
                    <Input
                      id="editTaxId"
                      value={editingClient.tax_id}
                      onChange={(e) => setEditingClient({ ...editingClient, tax_id: e.target.value })}
                      placeholder="Tax identification number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editCategory">Category *</Label>
                    <Select
                      value={editingClient.category}
                      onValueChange={(value) => setEditingClient({ ...editingClient, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {masterData?.clientCategories?.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editAssignedTo">
                      Ditugaskan ke {loadingMembers && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
                    </Label>
                    <Select
                      value={editingClient.assigned_to}
                      onValueChange={(value) => setEditingClient({ ...editingClient, assigned_to: value })}
                      disabled={loadingMembers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingMembers ? "Loading..." : "Select team member"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name} - {member.role.replace("_", " ").toUpperCase()}
                            {member.email && ` (${member.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editRecurringDueDate">Recurring Due Date</Label>
                  <Input
                    id="editRecurringDueDate"
                    type="date"
                    value={editingClient.recurring_due_date}
                    onChange={(e) => setEditingClient({ ...editingClient, recurring_due_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editAddress">Address</Label>
                  <Textarea
                    id="editAddress"
                    value={editingClient.address}
                    onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                    placeholder="Client address"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editNotes">Notes</Label>
                  <Textarea
                    id="editNotes"
                    value={editingClient.notes}
                    onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                    placeholder="Additional notes or tags"
                    rows={2}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateClient}>
                Update Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              {/* <div>
                <CardTitle>Client List ({filteredClients.length})</CardTitle>
                <CardDescription>All your assigned clients</CardDescription>
              </div> */}
              {/* <div className="text-sm text-muted-foreground">Team Members: {teamMembers.length}</div> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="as per case">As per case</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">Tax ID: {client.tax_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{client.pic_name}</p>
                        <p className="text-xs text-muted-foreground">{client.pic_phone}</p>
                        {client.assigned_to_name && (
                          <p className="text-xs text-blue-600">Assigned: {client.assigned_to_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(client.category)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">
                          <p className="text-xs text-muted-foreground">Tiap tanggal</p> {client.recurring_due_date}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(user.role === "admin" || user.role === "finance") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will deactivate the client "{client.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
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
            {filteredClients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No clients found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
