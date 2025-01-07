"use client"

import EditSingleVaccinationCenterProvider from "@/contexts/edit-single-vaccinationcenter-form"
import EditVaccinationCenterForm from "@/components/structures/edit-vaccinationcenter-form"
import RequireRole from "@/contexts/require-auth/require-role"

import { useParams } from "next/navigation"
import React from "react"

export default function EditSingleVaccinationCenter() {
  const params = useParams()

  return (
    <div>
      <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTOR]}>
        <EditSingleVaccinationCenterProvider>
          <EditVaccinationCenterForm params={params} />
        </EditSingleVaccinationCenterProvider>
      </RequireRole>
    </div>
  )
}
