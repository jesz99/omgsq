"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Home,
  Database,
  CreditCard,
  TrendingUp,
  Clock,
  CheckSquare,
  Target,
} from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
      window.location.href = "/"
    }
  }

  const getNavigationItems = () => {
    const baseItems = [{ name: "Dashboard", href: "/dashboard", icon: Home }]

    switch (user.role) {
      case "admin":
        return [
          ...baseItems,
          { name: "Users", href: "/users", icon: Users },
          { name: "Clients", href: "/clients", icon: UserCheck },
          { name: "Invoices", href: "/invoices", icon: FileText },
          { name: "All Invoices", href: "/all-invoices", icon: FileText },
          { name: "Payments", href: "/payments", icon: CreditCard },
          { name: "Reports", href: "/reports", icon: BarChart3 },
          { name: "Analytics", href: "/analytics", icon: TrendingUp },
          { name: "Team Overview", href: "/team-overview", icon: Users },
          { name: "Team Management", href: "/team", icon: Users },
          { name: "Performance", href: "/performance", icon: Target },
          { name: "Tasks", href: "/tasks", icon: CheckSquare },
          { name: "Task Management", href: "/task-management", icon: Target },
          { name: "Task Reports", href: "/task-reports", icon: BarChart3 },
          { name: "Master Data", href: "/master-data", icon: Database },
        ]

      case "director":
        return [
          ...baseItems,
          { name: "Users", href: "/users", icon: Users },
          { name: "Clients", href: "/clients", icon: UserCheck },
          { name: "Invoices", href: "/invoices", icon: FileText },
          { name: "All Invoices", href: "/all-invoices", icon: FileText },
          { name: "Reports", href: "/reports", icon: BarChart3 },
          { name: "Analytics", href: "/analytics", icon: TrendingUp },
          { name: "Team Overview", href: "/team-overview", icon: Users },
          { name: "Team Management", href: "/team", icon: Users },
          { name: "Performance", href: "/performance", icon: Target },
          { name: "Task Reports", href: "/task-reports", icon: BarChart3 },
        ]

      case "finance":
        return [
          ...baseItems,
          { name: "Klien", href: "/clients", icon: UserCheck },
          { name: "Semua Tagihan", href: "/all-invoices", icon: FileText },
          { name: "Buat Tagihan", href: "/invoices", icon: FileText },
          { name: "Buat Pembayaran", href: "/payments", icon: CreditCard }
        ]

      case "team_leader":
        return [
          ...baseItems,
          { name: "Clients", href: "/clients", icon: UserCheck },
          { name: "Invoices", href: "/invoices", icon: FileText },
          { name: "Tasks", href: "/tasks", icon: CheckSquare },
          { name: "Task Management", href: "/task-management", icon: Target },
          { name: "Team Management", href: "/team", icon: Users },
          { name: "Performance", href: "/performance", icon: Target },
        ]

      case "team_member":
        return [
          ...baseItems,
          { name: "Task Management", href: "/task-management", icon: Target },
        ]

      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={`pb-12 ${className}`}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">OMGS</h2>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <ScrollArea className="flex-1">
            <Sidebar />
          </ScrollArea>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <ScrollArea className="flex-1">
                <Sidebar />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user.role.replace("_", " ")}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
