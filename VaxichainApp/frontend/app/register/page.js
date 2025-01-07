import RegisterTemplate from "@/components/structures/register-template"
import React from "react"
import RegisterFormContextProvider from "@/contexts/register-form-context"
import NoAuth from "@/contexts/require-auth/not-authenticated"

export default function page() {
  return (
    <NoAuth>
      <RegisterFormContextProvider>
        <RegisterTemplate />
      </RegisterFormContextProvider>
    </NoAuth>
  )
}
