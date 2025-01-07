"use client"

import { useQuery } from "@tanstack/react-query"
import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"

const AddUserFormContext = createContext()

export const useAddUserForm = () => {
  const context = useContext(AddUserFormContext)

  if (!context) {
    throw new Error("use useAddUserForm within the context of AddUserFormProvider")
  }

  return context
}

export default function AddUserFormProvider({ children }) {
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
    <AddUserFormContext.Provider value={{ handleSubmit, errors, register, control, watch, setValue, getValues }}>
      {children}
    </AddUserFormContext.Provider>
  )
}
