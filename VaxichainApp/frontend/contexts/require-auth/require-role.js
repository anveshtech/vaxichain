"use client"

import { useQuery } from "@tanstack/react-query"
import React from "react"
import { getCurrentUser } from "../query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import LoadingAnimation from "@/components/composites/loading-animation"
import { redirect } from "next/navigation"

export default function RequireRole({ roles = [], children }) {
  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  })

  if (currentUser.isPending) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    )
  }

  if (!currentUser.isPending && !currentUser.data?.success) {
    redirect("/login")
  }

  const userType = currentUser.data?.data.userType;

  // Check if the user's role matches one of the allowed roles
  if (!roles.includes(userType)) {
    return redirect("/no-permission")
  }

  return <>{children}</>
}
