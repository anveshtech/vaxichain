"use client"

import React from "react"
import Input from "@/components/elements/input"
import { twMerge } from "tailwind-merge"

export default function InputWithIcon({
  useFormContext,
  iconElement,
  inputType = "input", // inputType can now be "input" or "select"
  wrapperClassName,
  inputClassName,
  takesFullWidth,
  className, //if not used, when passed className prop, causes issues
  label,
  children, // This is to handle `option` elements for `select`
  ...props
}) {
  const formContextValues = useFormContext()

  return (
    <div className={`space-y-2 ${takesFullWidth ? "col-start-1 col-end-1" : ""}`}>
      {label && (
        <div>
          <label>
            {label} {props.inputAttributes.required && <span className="text-red-600">*</span>}
          </label>
        </div>
      )}

      <div>
        <div
          className={twMerge(
            "flex items-center rounded-md border-2 border-[#bbbbbb]",
            wrapperClassName,
            formContextValues?.errors[props.inputAttributes.name] ? "border-red-600" : "",
          )}
          {...props.wrapperAttributes}
        >
          {iconElement}

          {/* Conditionally render input or select based on inputType */}
          {inputType === "select" ? (
            <select
              className={twMerge("w-full rounded-md px-3 py-2", inputClassName)}
              multiple={props.inputAttributes.multiple} // Ensure multiple is passed here
              {...props.inputAttributes}
            >
              {children}
            </select>
          ) : (
            <Input
              className={inputClassName}
              {...props.inputAttributes}
            />
          )}
        </div>

        {formContextValues?.errors[props.inputAttributes.name] && (
          <div>
            <span className="text-[0.75rem] text-red-600">
              {formContextValues?.errors[props.inputAttributes.name]?.message}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
