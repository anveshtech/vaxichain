import React from "react"
import { twMerge } from "tailwind-merge"

export default function Input({ type = "text", className, options = [], register, name, fieldRule = {}, ...props }) {
  const registerProp = register && name ? register(name, fieldRule) : {}

  return type === "select" ? (
    <select
      className={twMerge("w-full rounded-md p-2 outline-none", className)}
      {...registerProp}
      {...props}
    >
      {options.map((option) => (
        <option
          key={typeof option.value === "object" ? option.value._id : option.value}
          value={typeof option.value === "object" ? option.value._id : option.value}
          disabled={!option.value}
        >
          {option.text}
        </option>
      ))}
    </select>
  ) : (
    <input
      type={type}
      {...registerProp}
      className={twMerge("w-full rounded-md p-2 outline-none", className)}
      {...props}
    />
  )
}
