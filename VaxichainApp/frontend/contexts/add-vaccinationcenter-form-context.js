"use client"

import { useQuery } from "@tanstack/react-query"
import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"

const AddVaccinationCenterFormContext = createContext()

export const useAddVaccinationCenterForm = () => {
  const context = useContext(AddVaccinationCenterFormContext)

  if (!context) {
    throw new Error("use useAddVaccinationCenterForm within the context of AddVaccinationCenterFormProvider")
  }

  return context
}

export default function AddVaccinationCenterFormProvider({ children }) {
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
    <AddVaccinationCenterFormContext.Provider
      value={{ handleSubmit, errors, register, control, watch, setValue, getValues }}
    >
      {children}
    </AddVaccinationCenterFormContext.Provider>
  )
}
