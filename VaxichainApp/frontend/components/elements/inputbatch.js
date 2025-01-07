import React from "react"
import { twMerge } from "tailwind-merge"

export default function InputBatch({ type = "text", className, options = [], register, name, fieldRule = {}, ...props }) {
  const registerProp = register && name ? register(name, fieldRule) : {}

  return type === "select" ? (
    <select
      className={twMerge("w-full rounded-md p-2 outline-none", className)}
      {...registerProp}
      {...props}
    >
      <option value="" disabled>----- Please select your Batch Id ------</option> 
      {options.map((option) => (
        <option
          key={option.value} // Assuming option.value is unique
          value={option.value}
        >
          {option.label} 
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