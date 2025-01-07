"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleChildEditContext = createContext()

export const useSingleChildEdit = () => {
  const context = useContext(SingleChildEditContext)

  if (!context) {
    throw new Error("use useSingleChildEdit within the scope of EditSingleChildProvider")
  }

  return context
}

export default function EditSingleChildProvider({ children }) {
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm()

  return (
    <SingleChildEditContext.Provider value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}>
      {children}
    </SingleChildEditContext.Provider>
  )
}
