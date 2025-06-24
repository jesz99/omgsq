import { Card, CardContent } from "@/components/ui/card"
import { Database } from "lucide-react"

export default function MasterDataLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading master data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
