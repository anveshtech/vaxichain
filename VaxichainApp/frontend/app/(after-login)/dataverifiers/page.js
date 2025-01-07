import DataVerifiersTemplate from "@/components/structures/dataverifier-template"
import RequireRole from "@/contexts/require-auth/require-role"
import React from "react"

export default function DataVerifiersPage() {
  return (
    <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN, process.env.NEXT_PUBLIC_USER_TYPE_RETAILER]}>
      <DataVerifiersTemplate />
    </RequireRole>
  )
}
