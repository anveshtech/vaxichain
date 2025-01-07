"use client"

import EditDataCollector from "@/components/structures/datacollector-single-page"
import EditSingleDataCollectorEditProvider from "@/contexts/edit-single-datacollector"
import React from "react"

export default function SingleDataCollectorEdit({ params }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Edit DataCollectors</h2>
      </div>

      <div>
        <EditSingleDataCollectorEditProvider>
          <EditDataCollector params={params} />
        </EditSingleDataCollectorEditProvider>
      </div>
    </div>
  )
}
