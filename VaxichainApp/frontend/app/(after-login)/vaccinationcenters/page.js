import RequireRole from "@/contexts/require-auth/require-role"
import VaccinationCenterTemplate from "@/components/structures/vaccinationcenter-template"
import React from "react"

export default function VaccinationCenterPage() {
  return (
    <RequireRole
      roles={[
        process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN,
        process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTOR,
        process.env.NEXT_PUBLIC_USER_TYPE_DATACOLLECTORUSER,
      ]}
    >
      <VaccinationCenterTemplate />
    </RequireRole>
  )
}
