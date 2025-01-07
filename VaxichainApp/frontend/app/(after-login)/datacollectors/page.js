import DataCollectorsTemplate from "@/components/structures/datacollector-template"
import RequireRole from "@/contexts/require-auth/require-role"
import React from "react"

export default function DataCollectorsPage() {
  return (
    <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN, process.env.NEXT_PUBLIC_USER_TYPE_RETAILER]}>
      <DataCollectorsTemplate />
    </RequireRole>
  )
}
