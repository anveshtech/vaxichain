import RequireRole from "@/contexts/require-auth/require-role"

import React from "react"

import VaccinationTemplate from "@/components/structures/vaccination-template"

export default function VaccinationPage({ params }) {
  return (
    <RequireRole
      roles={[
        process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN,
        process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTOR,
        process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTORUSER,
      ]}
    >
      <VaccinationTemplate params={params} />
    </RequireRole>
  )
}
