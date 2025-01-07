"use client"

import React from "react"
import { twMerge } from "tailwind-merge"

export default React.forwardRef(function Button({ className, children, disabled, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={twMerge("rounded-md px-4 py-1", className, disabled ? "opacity-75" : "")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})
