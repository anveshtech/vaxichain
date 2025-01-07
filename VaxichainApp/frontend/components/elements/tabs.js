import React from "react"
import { usePathname } from "next/navigation"
import { twMerge } from "tailwind-merge"
import { useRouter } from "next/navigation"
import { useMenuContext } from "../blocks/menu-wrapper"
import ImgWithWrapper from "../composites/img-with-wrapper"
import Button from "./button"

export default function Tabs({ children, currentRole, ...props }) {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext()
  const router = useRouter()
  return (
    <div>
      <div
        className={twMerge(
          "mb-4 ml-1 flex items-center rounded-sm bg-yellow-400 px-2",
          isMenuExpanded ? "justify-between" : "justify-center",
        )}
      >
        <div
          onClick={() => router.push("/")}
          className="cursor-pointer"
        >
          <ImgWithWrapper
            imageAttributes={{ src: "/assets/logovaxi.png", alt: "logo", hidden: !isMenuExpanded }}
            imageClassName="object-contain object-left"
            wrapperClassName={twMerge(
              "h-[80px] transition-[width] duration-300", // Increased height
              isMenuExpanded ? "block w-[calc(1.4*80px)]" : "w-0", // Adjust width to match new height
            )}
          />
        </div>

        <Button
          className="p-0"
          onClick={() => setIsMenuExpanded((prev) => !prev)}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={twMerge(
              "inline-block h-[60px] w-8 transition-transform duration-300",
              isMenuExpanded ? "" : "rotate-180",
            )}
          >
            <path
              d="M16.75 2.25V22.25C16.75 22.7804 16.9607 23.2891 17.3358 23.6642C17.7109 24.0393 18.2196 24.25 18.75 24.25H22.75C23.2804 24.25 23.7891 24.0393 24.1642 23.6642C24.5393 23.2891 24.75 22.7804 24.75 22.25V2.25C24.75 1.71957 24.5393 1.21086 24.1642 0.835787C23.7891 0.460714 23.2804 0.25 22.75 0.25H18.75C18.2196 0.25 17.7109 0.460714 17.3358 0.835787C16.9607 1.21086 16.75 1.71957 16.75 2.25ZM22.75 2.25V22.25H18.75V2.25H22.75ZM4.578 11.25L7.164 8.664L5.75 7.25L0.75 12.25L5.75 17.25L7.164 15.836L4.578 13.25H10.75V24.25H12.75L12.75 0.25H10.75L10.75 11.25H4.578Z"
              fill="#fff"
            />
          </svg>
        </Button>
      </div>

      <ul
        className={twMerge("transition-[width] duration-300", isMenuExpanded ? "w-[250px]" : "w-14")}
        {...props}
      >
        {children}
      </ul>
    </div>
  )
}

const TabItem = ({ className, children, accessableBy, href, ...props }) => {
  const { currentUserRole } = useMenuContext()
  const pathname = usePathname()

  const isActive = pathname === href

  if (!accessableBy.includes(currentUserRole)) {
    return null
  }

  return (
    <li
      className={twMerge(
        "group whitespace-nowrap rounded-md px-2 py-2 font-semibold transition-all duration-300 hover:bg-purple-900",
        isActive && "bg-purple-700 text-white",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  )
}

Tabs.Item = TabItem
