import AddChildrenForm from "@/components/structures/add-children-form"

import AddVaccinationFormProvider from "@/contexts/add-vaccination-form-context"
import AddVaccinationForm from "@/components/structures/add-vaccination-form"

import React from "react"

export default function AddVaccinationPage({ params }) {
  const title = "Add Vaccination To Child"

  // Correctly destructure the parameters
  const { "single-vaccinationcenter": vaccinationCenterId, "single-children": childId } = params
  console.log("children id from addvcc", childId)
  console.log("Vaccination Center ID:", vaccinationCenterId)

  return (
    <div>
      <h2 className="my-4 text-2xl font-bold">{title}</h2>
      <AddVaccinationFormProvider>
        <div>
          <AddVaccinationForm
            vaccinationCenterId={vaccinationCenterId}
            childId={childId}
          />
        </div>
      </AddVaccinationFormProvider>
    </div>
  )
}
