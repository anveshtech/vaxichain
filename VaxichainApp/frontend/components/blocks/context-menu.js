"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import Button from "../elements/button"
import { twMerge } from "tailwind-merge"

const ContextMenuContext = createContext()

const useContextMenu = () => {
  const context = useContext(ContextMenuContext)

  if (!context) {
    throw new Error("use useContextMenu within the scope of ContextMenuProvider")
  }

  return context
}

export default function ContextMenu({ children, className, tableRef, contextMenuRef }) {
  const [open, setOpen] = useState(false)
  const [renderPosition, setRenderPosition] = useState({ top: "0", left: "0" })

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, tableRef, contextMenuRef, renderPosition, setRenderPosition }}>
      <div className={twMerge("inline-block", className)}>{children}</div>
    </ContextMenuContext.Provider>
  )
}

ContextMenu.Overlay = ({ children }) => {
  const { open, setOpen, setRenderPosition, tableRef, contextMenuRef } = useContextMenu()

  useEffect(() => {
    const eventHandler = () => setOpen(false)

    document.addEventListener("click", eventHandler)

    return () => {
      document.removeEventListener("click", eventHandler)
    }
  }, [])

  useEffect(() => {
    if (!tableRef?.current || !contextMenuRef?.current) return

    const tableInfo = tableRef.current?.getBoundingClientRect()
    const contextMenuInfo = contextMenuRef.current?.getBoundingClientRect()

    if (contextMenuInfo?.right > tableInfo?.right) {
      setRenderPosition((prev) => ({
        ...prev,
        left: `-${contextMenuInfo?.width}px`,
      }))
    }

    if (contextMenuInfo?.bottom > tableInfo?.bottom) {
      setRenderPosition((prev) => ({ ...prev, top: `-${contextMenuInfo?.height - 32}px` }))
    }
  }, [open])

  return <>{children}</>
}

ContextMenu.Menu = ({ children, contextMenuRef: contextMenuPropRef, ...props }) => {
  const { open, tableRef, contextMenuRef, renderPosition } = useContextMenu()

  return (
    open && (
      <ContextMenu.Overlay>
        <ul
          onClick={(e) => e.stopPropagation()}
          style={!tableRef?.current || !contextMenuRef?.current ? {} : renderPosition}
          ref={contextMenuRef}
          {...props}
        >
          {children}
        </ul>
      </ContextMenu.Overlay>
    )
  )
}

ContextMenu.Item = ({ children, className, ...props }) => (
  <li className={className}>
    <Button
      {...props}
      className="w-full"
    >
      {children}
    </Button>
  </li>
)

ContextMenu.Trigger = ({ children, ...props }) => {
  const { setOpen } = useContextMenu()

  return (
    <Button
      {...props}
      onClick={() => setOpen(true)}
    >
      {children}
    </Button>
  )
}
