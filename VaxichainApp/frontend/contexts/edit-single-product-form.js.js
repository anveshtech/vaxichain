"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleProductEditContext = createContext()

export const useSingleProductEdit = () => {
  const context = useContext(SingleProductEditContext)

  if (!context) {
    throw new Error("use useSingleProductEdit within the scope of EditSingleProductProvider")
  }

  return context
}

export default function EditSingleProductProvider({ children }) {
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
    <SingleProductEditContext.Provider value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}>
      {children}
    </SingleProductEditContext.Provider>
  )
}
