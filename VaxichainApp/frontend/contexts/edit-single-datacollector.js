"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleDataCollectorEditContext = createContext()

export const useSingleDataCollectorEdit = () => {
  const context = useContext(SingleDataCollectorEditContext)

  if (!context) {
    throw new Error("use useSingleDataCollectorEdit within the scope of EditSingleDataCollectorEditProvider")
  }

  return context
}

export default function EditSingleDataCollectorEditProvider({ children }) {
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
    <SingleDataCollectorEditContext.Provider
      value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}
    >
      {children}
    </SingleDataCollectorEditContext.Provider>
  )
}
