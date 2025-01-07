"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const LoginFormContext = createContext()

export const useLoginFormContext = () => {
  const context = useContext(LoginFormContext)

  if (!context) {
    throw new Error("use useLoginFormContext within the context of LoginFormContextProvider")
  }

  return context
}

export default function LoginFormContextProvider({ children }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  return <LoginFormContext.Provider value={{ register, handleSubmit, errors }}>{children}</LoginFormContext.Provider>
}
