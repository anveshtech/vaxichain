import OrgUsersTemplate from "@/components/structures/orguser-template"
import RequireRole from "@/contexts/require-auth/require-role"
import React from "react"

export default function DataVerifiersPage() {
  return (
    <RequireRole
      roles={[
        process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN,
        process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTOR,
        process.env.NEXT_PUBLIC_USER_TYPE_DATAVERIFIER,
      ]}
    >
      <OrgUsersTemplate />
    </RequireRole>
  )
}
