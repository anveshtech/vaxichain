"use client"

import { routeToCrumb } from "@/utils/staticUtils"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

export default function Breadcrumbs() {
  const pathname = usePathname()
  const pathnameArray = pathname === "/" ? ["", "dashboard"] : pathname?.split("/")
  const routesArray = pathnameArray.slice(1)

  let currentLink = null

  const isObjectId = (route) => {
    return /^[a-f\d]{24}$/i.test(route)
  }

  return (
    <div className="flex text-sm text-purple-700">
      {routesArray.map((route, idx, arr) => {
        currentLink = currentLink ? `${currentLink}/${route}` : `/${route}`
        const displayRoute = isObjectId(route) ? "" : (routeToCrumb[route] ?? route)

        return (
          <div key={idx}>
            {idx !== arr.length - 1 ? (
              <>
                <Link href={currentLink}>
                  <span>{displayRoute}</span>
                </Link>

                <FontAwesomeIcon
                  className="mx-2 text-xs text-black"
                  icon={faChevronRight}
                />
              </>
            ) : (
              <span className="text-purple-700">{displayRoute}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
