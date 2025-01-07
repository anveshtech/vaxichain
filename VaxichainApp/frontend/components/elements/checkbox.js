import React from "react"
import { twMerge } from "tailwind-merge"

export default function Checkbox({ type = "checkbox", register, name, fieldRule, className, ...props }) {
  const registerProp = register ? register(name, fieldRule) : {}

  return (
    <input
      type={type}
      {...registerProp}
      className={twMerge("rounded-md outline-none", className)}
      {...props}
    />
  )
}
