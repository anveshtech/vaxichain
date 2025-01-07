"use client"

import { useQuery } from "@tanstack/react-query"
import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"

const AddVaccinationFormContext = createContext()

export const useAddVaccinationForm = () => {
  const context = useContext(AddVaccinationFormContext)

  if (!context) {
    throw new Error("use useAddVaccinationForm within the context of AddVaccinationFormProvider")
  }

  return context
}

export default function AddVaccinationFormProvider({ children }) {
  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  })

  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
    watch,
    setValue,
    getValues,
  } = useForm({
    // defaultValues: {
    //   productManufacturer: currentUser?.data?.data?.companyName,
    // },
  })

  return (
    <AddVaccinationFormContext.Provider value={{ handleSubmit, errors, register, control, watch, setValue, getValues }}>
      {children}
    </AddVaccinationFormContext.Provider>
  )
}
