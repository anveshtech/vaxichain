import React from "react"
import Footer from "@/components/blocks/foooter"
import Header from "@/components/blocks/header"
import SideMenu from "@/components/blocks/side-menu"
import Breadcrumbs from "@/components/composites/breadcrumbs"
import MenuWrapper from "@/components/blocks/menu-wrapper"
import RequireAuth from "@/contexts/require-auth/require-auth"

export default function AfterLoginLayout({ children }) {
  return (
    <RequireAuth>
      <div className="container max-w-[3000rem]">
        <div className="sticky top-0 mt-2 flex gap-4">
          <MenuWrapper>
            <div className="sticky top-0 ml-[-15px] h-screen rounded-md bg-white px-2 pt-8 text-white shadow-md">
              <SideMenu />
            </div>
          </MenuWrapper>

          <div className="flex-grow space-y-6 overflow-auto">
            <Header />

            <Breadcrumbs />

            {children}

            <Footer />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
