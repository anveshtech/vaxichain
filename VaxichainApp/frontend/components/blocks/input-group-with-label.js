import React from "react"
import { twMerge } from "tailwind-merge"

export default function InputGroupWithLabel({ cols, label, wrapperClassName, requiredField, children }) {
  return (
    <div className={twMerge("space-y-2 rounded-lg px-4", wrapperClassName)}>
      {label && (
        <h3 className="text-base">
          {label} {requiredField && <span className="text-red-600">*</span>}
        </h3>
      )}

      <div className={`grid grid-columns-${cols} gap-4`}>{children}</div>
    </div>
  )
}
