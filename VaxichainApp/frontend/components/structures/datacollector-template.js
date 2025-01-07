"use client"

import React from "react"
import DataTable from "../blocks/data-table-collectors"
import { useRouter } from "next/navigation"
import DataCollectorsProvider from "@/contexts/datacollectors-context"

export default function DataCollectorsTemplate() {
  const title = "Data Collectors List"

  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold">{title}</h2>
      </div>

      <DataCollectorsProvider>
        <div className="flex items-center gap-2"></div>

        <div>
          <DataTable />
        </div>
      </DataCollectorsProvider>
    </div>
  )
}
