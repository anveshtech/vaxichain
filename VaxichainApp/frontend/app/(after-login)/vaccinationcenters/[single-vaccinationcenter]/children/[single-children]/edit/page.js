"use client"

import { useParams } from "next/navigation"
import React from "react"
import EditSingleChildProvider from "@/contexts/edit-single-children-form-context"
import EditChildrenForm from "@/components/structures/edit-children-form"

export default function EditSingleChildren() {
  const params = useParams()

  // Correctly destructure the parameters
  const { "single-vaccinationcenter": vaccinationCenterId, "single-children": childId } = params

  console.log("Vaccination Center ID:", vaccinationCenterId)
  console.log("Child ID:", childId)

  return (
    <div>
      <EditSingleChildProvider>
        <EditChildrenForm
          vaccinationCenterId={vaccinationCenterId}
          childId={childId}
        />
      </EditSingleChildProvider>
    </div>
  )
}
