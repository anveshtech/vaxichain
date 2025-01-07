"use client"

import React, { useId } from "react"
import { useRadioGroupContext } from "../blocks/radio-group"

export default function Radio({ label, ...props }) {
  const id = useId()
  const { name, fieldRule, register } = useRadioGroupContext()

  const registerProp = name && register ? register(name, fieldRule) : {}

  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id={id}
        {...registerProp}
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}
