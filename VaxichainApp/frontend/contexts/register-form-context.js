"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const FormContext = createContext()

export function useRegisterFormContext() {
  return useContext(FormContext)
}

export default function RegisterFormContextProvider({ children }) {
  const {
    handleSubmit,
    register,
    watch,
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      userType: "",
    },
  })

  return (
    <FormContext.Provider
      value={{
        handleSubmit,
        register,
        watch,
        control,
        errors,
        setError,
        clearErrors,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}
