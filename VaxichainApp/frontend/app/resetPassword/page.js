"use client"

import React, { Suspense } from "react"
import ResetPassword from "./resetPassword"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  )
}
