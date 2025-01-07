"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleDataVerifierEditContext = createContext()

export const useSingleDataVerifierEdit = () => {
  const context = useContext(SingleDataVerifierEditContext)

  if (!context) {
    throw new Error("use useSingleDataVerifierEdit within the scope of EditSingleDataVerifierEditProvider")
  }

  return context
}

export default function EditSingleDataVerifierEditProvider({ children }) {
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
    <SingleDataVerifierEditContext.Provider
      value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}
    >
      {children}
    </SingleDataVerifierEditContext.Provider>
  )
}
