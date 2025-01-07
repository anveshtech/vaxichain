"use client"

import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "../query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import { redirect } from "next/navigation"
import LoadingAnimation from "@/components/composites/loading-animation"

export default function NoAuth({ children }) {
  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  })

  if (currentUser.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingAnimation />
      </div>
    )
  }

  if (!currentUser.isPending && currentUser.data?.success) {
    redirect("/")
  }

  return <>{children}</>
}
