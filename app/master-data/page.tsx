"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Settings, Database } from "lucide-react"
import { useMasterData } from "@/hooks/use-master-data"
import { useAuth } from "@/hooks/use-auth"

interface MasterDataItem {
  id: string
  name: string
  [key: string]: any
}

export default function MasterDataPage() {
  const { user } = useAuth()
  const { masterData, loading, error, refreshMasterData } = useMasterData()
  const [selectedTab, setSelectedTab] = useState("payment-methods")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)
  const [formData, setFormData] = useState<any>({})

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      window.location.href = "/dashboard"
    }
  }, [user])

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">Only administrators can access master data management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const masterDataTabs = [
    { id: "payment-methods", label: "Payment Methods", data: masterData.paymentMethods },
    { id: "task-categories", label: "Task Categories", data: masterData.taskCategories },
    { id: "priorities", label: "Priorities", data: masterData.priorities },
    { id: "client-categories", label: "Client Categories", data: masterData.clientCategories },
    { id: "invoice-statuses", label: "Invoice Statuses", data: masterData.invoiceStatuses },
    { id: "task-statuses", label: "Task Statuses", data: masterData.taskStatuses },
    { id: "user-roles", label: "User Roles", data: masterData.userRoles },
    { id: "bank-accounts", label: "Bank Accounts", data: masterData.bankAccounts },
  ]

  const handleAdd = (tabId: string) => {
    setEditingItem(null)
    setFormData({})
    setSelectedTab(tabId)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: MasterDataItem, tabId: string) => {
    setEditingItem(item)
    setFormData(item)
    setSelectedTab(tabId)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      // This would normally call an API to save the data
      console.log("Saving:", { selectedTab, formData, editingItem })

      // For now, just close the dialog and refresh
      setIsDialogOpen(false)
      refreshMasterData()
    } catch (error) {
      console.error("Error saving master data:", error)
    }
  }

  const handleDelete = async (item: MasterDataItem, tabId: string) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        // This would normally call an API to delete the data
        console.log("Deleting:", { tabId, item })
        refreshMasterData()
      } catch (error) {
        console.error("Error deleting master data:", error)
      }
    }
  }

  const renderFormFields = () => {
    switch (selectedTab) {
      case "payment-methods":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Payment Method Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bank Transfer"
              />
            </div>
          </div>
        )

      case "task-categories":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tax Preparation"
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., FileText"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.color || ""}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "priorities":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Priority Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., High"
              />
            </div>
            <div>
              <Label htmlFor="level">Level (1-4)</Label>
              <Input
                id="level"
                type="number"
                min="1"
                max="4"
                value={formData.level || ""}
                onChange={(e) => setFormData({ ...formData, level: Number.parseInt(e.target.value) })}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.color || ""}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "bank-accounts":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Primary Business Account"
              />
            </div>
            <div>
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={formData.account_number || ""}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="e.g., 1234567890"
              />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>
        )
    }
  }

  const renderTableRow = (item: MasterDataItem, tabId: string) => {
    switch (tabId) {
      case "task-categories":
        return (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.icon}</TableCell>
            <TableCell>
              <Badge variant="outline" className={`bg-${item.color}-100 text-${item.color}-800`}>
                {item.color}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(item, tabId)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item, tabId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )

      case "priorities":
        return (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.level}</TableCell>
            <TableCell>
              <Badge variant="outline" className={`bg-${item.color}-100 text-${item.color}-800`}>
                {item.color}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(item, tabId)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item, tabId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )

      case "bank-accounts":
        return (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.account_number}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(item, tabId)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item, tabId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )

      default:
        return (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(item, tabId)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item, tabId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )
    }
  }

  const getTableHeaders = (tabId: string) => {
    switch (tabId) {
      case "task-categories":
        return ["Name", "Icon", "Color", "Actions"]
      case "priorities":
        return ["Name", "Level", "Color", "Actions"]
      case "bank-accounts":
        return ["Account Name", "Account Number", "Actions"]
      default:
        return ["Name", "Actions"]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p>Loading master data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Data Management</h1>
          <p className="text-muted-foreground">Manage system-wide configuration data</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <Database className="h-5 w-5" />
              <span>Error loading master data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="payment-methods" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {masterDataTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {masterDataTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{tab.label}</CardTitle>
                    <CardDescription>Manage {tab.label.toLowerCase()} used throughout the system</CardDescription>
                  </div>
                  <Button onClick={() => handleAdd(tab.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {tab.label.slice(0, -1)}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {getTableHeaders(tab.id).map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tab.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={getTableHeaders(tab.id).length} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <Database className="mx-auto h-8 w-8 mb-2" />
                            <p>No {tab.label.toLowerCase()} found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tab.data.map((item) => renderTableRow(item, tab.id))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"} {masterDataTabs.find((t) => t.id === selectedTab)?.label.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details below" : "Enter the details for the new item"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">{renderFormFields()}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
