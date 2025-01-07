"use client"

import EditDataVerifier from "@/components/structures/dataverifier-single-page"
import EditSingleDataVerifierEditProvider from "@/contexts/edit-single-dataverifier"
import React from "react"

export default function SingleDataVerifierEdit({ params }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Edit DataVerifier</h2>
      </div>

      <div>
        <EditSingleDataVerifierEditProvider>
          <EditDataVerifier params={params} />
        </EditSingleDataVerifierEditProvider>
      </div>
    </div>
  )
}
