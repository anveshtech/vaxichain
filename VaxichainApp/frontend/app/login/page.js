import LoginTemplate from "@/components/structures/login-template"
import LoginFormContextProvider from "@/contexts/login-form-context"
import NoAuth from "@/contexts/require-auth/not-authenticated"
import React from "react"

export default function page() {
  return (
    <NoAuth>
      <LoginFormContextProvider>
        <LoginTemplate />
      </LoginFormContextProvider>
    </NoAuth>
  )
}
