"use client"

import EditSingleOrgUserForm from "@/components/structures/edit-orguser-form"

import EditSingleOrgUserProvider from "@/contexts/edit-single-orguser-form"

import { useParams } from "next/navigation"
import React from "react"

export default function EditSingleOrgUser() {
  const params = useParams()

  return (
    <div>
      <EditSingleOrgUserProvider>
        <EditSingleOrgUserForm params={params} />
      </EditSingleOrgUserProvider>
    </div>
  )
}
