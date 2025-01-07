"use client"

import { useQuery } from "@tanstack/react-query"
import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"

const AddChildrenFormContext = createContext()

export const useAddChildrenForm = () => {
  const context = useContext(AddChildrenFormContext)

  if (!context) {
    throw new Error("use useAddChildrenForm within the context of AddChildrenFormProvider")
  }

  return context
}

export default function AddChildrenFormProvider({ children }) {
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
    <AddChildrenFormContext.Provider value={{ handleSubmit, errors, register, control, watch, setValue, getValues }}>
      {children}
    </AddChildrenFormContext.Provider>
  )
}
