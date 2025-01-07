import AddVaccinationCenterFormTemplate from "@/components/structures/add-vaccinationcenter-form"
import AddChildrenForm from "@/components/structures/add-children-form"
import AddChildrenFormProvider from "@/contexts/add-children-form-context"

import React from "react"

export default function AddChildrenPage({ params }) {
  const title = "Add New Children"
  const { "single-vaccinationcenter": vaccinationCenterId } = params // Accessing directly from params

  return (
    <div>
      <h2 className="my-4 text-2xl font-bold">{title}</h2>
      <AddChildrenFormProvider>
        <div>
          <AddChildrenForm vaccinationCenterId={vaccinationCenterId} />
        </div>
      </AddChildrenFormProvider>
    </div>
  )
}
