import React, { useState } from "react"
import { twMerge } from "tailwind-merge"

export default function AnimatedInput({
  type = "text",
  required,
  className,
  placeholder,
  register,
  getValues,
  name,
  fieldRule = {},
  errors,
  ...props
}) {
  const registerProps = register && name ? register(name, fieldRule) : {}

  const [placeHolderOnTop, setPlaceHolderOnTop] = useState(() => getValues(name))

  return (
    <div className="relative z-10">
      {type.toLowerCase() === "textarea" ? (
        <>
          <textarea
            type={type}
            className={twMerge(
              "peer w-full rounded-md border-2 border-[#bbb] bg-transparent p-2 outline-none",
              errors && errors[name] ? "border-red-600" : "",
            )}
            required={required}
            {...registerProps}
            {...props}
            onFocus={() => setPlaceHolderOnTop(true)}
            onBlur={() => {
              const fieldValue = getValues(name)?.trim()

              if (fieldValue && fieldValue !== "<p></p>") return

              return setPlaceHolderOnTop(false)
            }}
          />

          <span
            className={twMerge(
              "absolute left-2 top-6 -z-10 -translate-y-1/2 border-none bg-white px-2 opacity-50 transition-all duration-300 hover:cursor-text",
              placeHolderOnTop ? "top-0 z-10 text-xs opacity-100" : "",
              errors[name] ? (placeHolderOnTop ? "text-red-600" : "") : "",
            )}
          >
            {placeholder} {required && "*"}
          </span>
        </>
      ) : (
        <>
          <input
            type={type}
            className={twMerge(
              "peer w-full rounded-md border-2 border-[#bbb] bg-transparent p-2 outline-none",
              errors && errors[name] ? "border-red-600" : "",
            )}
            required={required}
            {...registerProps}
            {...props}
            onFocus={() => setPlaceHolderOnTop(true)}
            onBlur={() => {
              const fieldValue = getValues(name)?.trim()

              if (fieldValue && fieldValue !== "<p></p>") return

              return setPlaceHolderOnTop(false)
            }}
          />

          <span
            className={twMerge(
              "absolute left-2 top-1/2 -z-10 -translate-y-1/2 border-none bg-white px-2 opacity-50 transition-all duration-300 hover:cursor-text",
              placeHolderOnTop ? "top-0 z-10 text-xs opacity-100" : "",
              errors[name] ? (placeHolderOnTop ? "text-red-600" : "") : "",
            )}
          >
            {placeholder} {required && "*"}
          </span>
        </>
      )}
    </div>
  )
}
