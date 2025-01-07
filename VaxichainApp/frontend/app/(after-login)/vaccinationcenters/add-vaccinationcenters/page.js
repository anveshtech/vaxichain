import AddVaccinationCenterFormTemplate from "@/components/structures/add-vaccinationcenter-form"

import AddVaccinationCenterFormProvider from "@/contexts/add-vaccinationcenter-form-context"

import React from "react"

export default function AddVacinationCenterPage() {
  const title = "Add New Vaccination Center "

  return (
    <div>
      <h2 className="my-4 text-2xl font-bold">{title}</h2>

      <AddVaccinationCenterFormProvider>
        <div>
          <AddVaccinationCenterFormTemplate />
        </div>
      </AddVaccinationCenterFormProvider>
    </div>
  )
}
