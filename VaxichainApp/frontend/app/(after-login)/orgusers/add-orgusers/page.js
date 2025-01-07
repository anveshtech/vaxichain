import AddOrgUserFormTemplate from "@/components/structures/add-orguser-form"

import AddUserFormProvider from "@/contexts/add-user-form-context"

import React from "react"

export default function AddOrgUserPage() {
  const title = "Add New User"

  return (
    <div>
      <h2 className="my-4 text-2xl font-bold">{title}</h2>

      <AddUserFormProvider>
        <div>
          <AddOrgUserFormTemplate />
        </div>
      </AddUserFormProvider>
    </div>
  )
}
