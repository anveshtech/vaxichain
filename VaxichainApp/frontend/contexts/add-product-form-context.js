"use client"

import { useQuery } from "@tanstack/react-query"
import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"

const AddProductFormContext = createContext()

export const useAddProductForm = () => {
  const context = useContext(AddProductFormContext)

  if (!context) {
    throw new Error("use useAddProductForm within the context of AddProductFormProvider")
  }

  return context
}

export default function AddProductFormProvider({ children }) {
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
    defaultValues: {
      productManufacturer: currentUser?.data?.data?.companyName,
    },
  })

  return (
    <AddProductFormContext.Provider value={{ handleSubmit, errors, register, control, watch, setValue, getValues }}>
      {children}
    </AddProductFormContext.Provider>
  )
}
