"use client"

import React, { createContext, useContext } from "react"
import { twMerge } from "tailwind-merge"

const RadioGroupContext = createContext()

export const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext)

  if (!context) {
    throw new Error("use useRadioGroupContext within the scope of RadioGroup")
  }

  return context
}

export default function RadioGroup({
  wrapperClassName,
  className,
  label,
  errors,
  name,
  fieldRule = {},
  register,
  children,
  ...props
}) {
  return (
    <div
      {...props}
      className={twMerge(wrapperClassName, errors && errors[name] ? "" : "")}
    >
      {label && (
        <div className="w-fit space-x-2 bg-white px-2">
          <span className={twMerge("font-semibold", errors && errors[name] ? "text-red-600" : "")}>{label}</span>
        </div>
      )}

      <div className={twMerge("space-y-2 py-4", className)}>
        <RadioGroupContext.Provider value={{ name, fieldRule, register }}>{children}</RadioGroupContext.Provider>
      </div>
    </div>
  )
}
