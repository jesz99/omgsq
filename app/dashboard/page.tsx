"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { TeamMemberDashboard } from "@/components/dashboards/team-member-dashboard"
import { TeamLeaderDashboard } from "@/components/dashboards/team-leader-dashboard"
import { FinanceDashboard } from "@/components/dashboards/finance-dashboard"
import { DirectorDashboard } from "@/components/dashboards/director-dashboard"
import { Loader2 } from "lucide-react"

export default function Dashboard() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/"
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />
      case "team_member":
        return <TeamMemberDashboard />
      case "team_leader":
        return <TeamLeaderDashboard />
      case "finance":
        return <FinanceDashboard />
      case "director":
        return <DirectorDashboard />
      default:
        return <div>Invalid role: {user.role}</div>
    }
  }

  return <DashboardLayout user={user}>{renderDashboard()}</DashboardLayout>
}
