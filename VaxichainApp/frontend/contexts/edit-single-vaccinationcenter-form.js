"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleVaccinationCenterEditContext = createContext()

export const useSingleVaccinationCenterEdit = () => {
  const context = useContext(SingleVaccinationCenterEditContext)

  if (!context) {
    throw new Error("use useSingleVaccinationCenterEdit within the scope of EditSingleVaccinationCenterProvider")
  }

  return context
}

export default function EditSingleVaccinationCenterProvider({ children }) {
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
    <SingleVaccinationCenterEditContext.Provider
      value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}
    >
      {children}
    </SingleVaccinationCenterEditContext.Provider>
  )
}
