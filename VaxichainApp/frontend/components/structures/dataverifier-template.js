"use client"

import React from "react"
import DataTable from "../blocks/data-table-verifiers"
import { useRouter } from "next/navigation"
import DataVerifiersProvider from "@/contexts/dataverifiers-context"

export default function DataVerifiersTemplate() {
  const title = "Data Verifiers List"

  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold">{title}</h2>
      </div>

      <DataVerifiersProvider>
        <div className="flex items-center gap-2"></div>

        <div>
          <DataTable />
        </div>
      </DataVerifiersProvider>
    </div>
  )
}
