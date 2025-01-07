"use client"

import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import { useQuery } from "@tanstack/react-query"
import React from "react"

const MenuContext = React.createContext()

export const useMenuContext = () => {
  const context = React.useContext(MenuContext)

  if (!context) {
    throw new Error("use menu context within the scope of provider")
  }

  return context
}

export default function MenuWrapper({ children }) {
  const [isMenuExpanded, setIsMenuExpanded] = React.useState(true)

  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  })

  return (
    <MenuContext.Provider
      value={{ isMenuExpanded, setIsMenuExpanded, currentUserRole: currentUser.data?.data.userType }}
    >
      {children}
    </MenuContext.Provider>
  )
}
