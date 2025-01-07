import RequireRole from "@/contexts/require-auth/require-role"

import React from "react"
import ChildrenTemplate from "@/components/structures/children-template"

export default function ChildrenPage({ params }) {
  return (
    <RequireRole
      roles={[
        process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN,
        process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTOR,
        process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTORUSER,
      ]}
    >
      <ChildrenTemplate params={params} />
    </RequireRole>
  )
}
