"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleOrgUserEditContext = createContext()

export const useSingleOrgUserEdit = () => {
  const context = useContext(SingleOrgUserEditContext)

  if (!context) {
    throw new Error("use useSingleOrgUserEdit within the scope of Editsingleuser")
  }

  return context
}

export default function EditSingleOrgUserProvider({ children }) {
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
    <SingleOrgUserEditContext.Provider value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}>
      {children}
    </SingleOrgUserEditContext.Provider>
  )
}
