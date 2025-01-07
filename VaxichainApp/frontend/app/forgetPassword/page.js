import React from "react"

import NoAuth from "@/contexts/require-auth/not-authenticated"
import ForgetPasswordTemplate from "@/components/structures/forgetPassword-template"
import ForgetPasswordFormContextProvider from "@/contexts/forgotPassword-form-context"

export default function page() {
  return (
    <NoAuth>
      <ForgetPasswordFormContextProvider>
        <ForgetPasswordTemplate />
      </ForgetPasswordFormContextProvider>
    </NoAuth>
  )
}
