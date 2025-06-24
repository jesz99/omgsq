import { BarChart } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <BarChart className="h-8 w-8 animate-pulse mx-auto mb-4" />
        <p className="text-muted-foreground">Loading task reports...</p>
      </div>
    </div>
  )
}
