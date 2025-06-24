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
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Edit, Search, Upload, Calendar, Loader2 } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"

export default function ClientsPage() {
  const { user, loading } = useAuth()
  const { masterData, loading: masterDataLoading } = useMasterData()
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "ABC Corporation",
      picName: "John Smith",
      picPhone: "+1234567890",
      taxId: "TAX123456",
      category: "Monthly",
      address: "123 Business St, City",
      nextDue: "2024-02-01",
      status: "Active",
    },
    {
      id: 2,
      name: "XYZ Industries",
      picName: "Sarah Johnson",
      picPhone: "+1234567891",
      taxId: "TAX789012",
      category: "Yearly",
      address: "456 Corporate Ave, City",
      nextDue: "2024-12-31",
      status: "Active",
    },
    {
      id: 3,
      name: "Tech Solutions Ltd",
      picName: "Mike Wilson",
      picPhone: "+1234567892",
      taxId: "TAX345678",
      category: "As per case",
      address: "789 Tech Park, City",
      nextDue: "N/A",
      status: "Pending",
    },
  ])

  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    picName: "",
    picPhone: "",
    taxId: "",
    category: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    }
  }, [user, loading])

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

  const handleAddClient = () => {
    if (newClient.name && newClient.picName && newClient.category) {
      const client = {
        id: clients.length + 1,
        ...newClient,
        status: "Active",
        nextDue:
          newClient.category === "Monthly" ? "2024-02-01" : newClient.category === "Yearly" ? "2024-12-31" : "N/A",
      }
      setClients([...clients, client])
      setNewClient({ name: "", picName: "", picPhone: "", taxId: "", category: "", address: "", notes: "" })
      setIsAddClientOpen(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      Monthly: "bg-blue-100 text-blue-800",
      Yearly: "bg-green-100 text-green-800",
      "As per case": "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{category}</Badge>
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Client Management</h1>
            <p className="text-muted-foreground">Manage your client profiles and information</p>
          </div>
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Create a new client profile with their information.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Enter client company name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="picName">PIC Name</Label>
                  <Input
                    id="picName"
                    value={newClient.picName}
                    onChange={(e) => setNewClient({ ...newClient, picName: e.target.value })}
                    placeholder="Person in charge name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="picPhone">PIC Phone</Label>
                  <Input
                    id="picPhone"
                    value={newClient.picPhone}
                    onChange={(e) => setNewClient({ ...newClient, picPhone: e.target.value })}
                    placeholder="Person in charge phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={newClient.taxId}
                    onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })}
                    placeholder="Tax identification number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newClient.category}
                    onValueChange={(value) => setNewClient({ ...newClient, category: value })}
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
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="Client address"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="Additional notes or tags"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="files">Upload Files (Max 2MB)</Label>
                  <div className="flex items-center gap-2">
                    <Input id="files" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png" />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddClient}>
                  Add Client
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client List</CardTitle>
            <CardDescription>All your assigned clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search clients..." className="max-w-sm" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="case">As per case</SelectItem>
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
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">Tax ID: {client.taxId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{client.picName}</p>
                        <p className="text-xs text-muted-foreground">{client.picPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(client.category)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{client.nextDue}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
