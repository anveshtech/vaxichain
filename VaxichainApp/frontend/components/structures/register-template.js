"use client"

import React, { useEffect, useState } from "react"
import ImgWithWrapper from "../composites/img-with-wrapper"
import InputWithIcon from "../composites/input-with-icon"
import InputGroupWithLabel from "../blocks/input-group-with-label"
import { userTypeOptions } from "@/utils/staticUtils"
import Button from "../elements/button"
import { countriesData } from "@/utils/countryData"
import {
  addressLineRule,
  cityRule,
  companyNameRule,
  countryRule,
  firstNameRule,
  lastNameRule,
  middleNameRule,
  phoneRule,
  // productTypeRule,
  registerEmailRule,
  registrationConfirmPasswordRule,
  registrationPasswordRule,
  userTypeRule,
  zipRule,
} from "@/utils/validation"
import { useRegisterFormContext } from "@/contexts/register-form-context"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function RegisterTemplate() {
  const router = useRouter()
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

  const { register, handleSubmit, control, watch, setError, clearErrors } = useRegisterFormContext()

  const registerMutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: (response) => {
      toast.success(
        <>
          <span>{response.message}</span> <br />
          <span>Please Login</span>
        </>,
      )

      router.push("/login")
    },
    onError: (error) =>
      toast.error(
        <>
          <span>{error.data.message}</span> <br />
          <span>Please try again</span>
        </>,
      ),
  })

  const submitFn = (formData) => {
    const dataToPost = {
      ...formData,
      password: formData.registerPassword,
      email: formData.registerEmail,
      phoneNumber: formData.phone,
      address: {
        zip: formData.zip,
        city: formData.city,
        country: selectedCountry,
        addressLine: formData.addressLine,
      },
    }

    return registerMutation.mutate(dataToPost)
  }

  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("")

  useEffect(() => {
    setCountries(countriesData)
  }, [])
  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible)
  }
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!isConfirmPasswordVisible)
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Left side image container */}
      <div className="h-full w-0 bg-[url('/assets/loginImage.webp')] bg-cover bg-bottom bg-no-repeat md:w-[30%]"></div>

      {/* Right side form container */}
      <div className="flex h-full w-full flex-col items-center justify-center md:w-[70%]">
        {/* Heading and welcome message */}

        {/* Form container */}
        <div className="flex-shrink space-y-6 rounded-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-purple-700">Create Your Account</h1>
            <p className="text-lg">Welcome! We're excited to have you join us</p>
          </div>

          {/* Already have an account message */}
          <div className="mb-2 text-center">
            <span>Already have an account? </span>
            <button
              onClick={() => router.push("/login")}
              className="cursor-pointer font-bold text-purple-700"
            >
              Login
            </button>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg px-4">
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "text",
                  required: true,
                  placeholder: "Organization Name",
                  name: "companyName",
                  register,
                  fieldRule: companyNameRule,
                }}
                label={<span className="font-bold">Organization Name</span>}
              />
            </div>
            {/* Full Name Input Group */}
            <InputGroupWithLabel
              cols={3}
              label={<span className="font-bold">Contact Person's Name</span>}
              requiredField
            >
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "text",
                  placeholder: "First Name",
                  required: true,
                  name: "firstName",
                  register,
                  fieldRule: firstNameRule,
                }}
              />
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "text",
                  placeholder: "Middle Name",
                  name: "middleName",
                  register,
                  fieldRule: middleNameRule,
                }}
              />
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "text",
                  placeholder: "Last Name",
                  required: true,
                  name: "lastName",
                  register,
                  fieldRule: lastNameRule,
                }}
              />
            </InputGroupWithLabel>

            {/* Address Input Group */}
            <InputGroupWithLabel
              cols={1}
              label={<span className="font-bold">Address</span>}
              requiredField
            >
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                takesFullWidth
                inputAttributes={{
                  type: "text",
                  placeholder: "Address Line",
                  required: true,
                  name: "addressLine",
                  register,
                  fieldRule: addressLineRule,
                }}
              />
            </InputGroupWithLabel>
            <InputGroupWithLabel
              cols={2}
              requiredField
            >
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "text",
                  placeholder: "City/State",
                  required: true,
                  name: "city",
                  register,
                  fieldRule: cityRule,
                }}
              />
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "text",
                  placeholder: "Zip Code",
                  required: true,
                  name: "zip",
                  register,
                  fieldRule: zipRule,
                }}
              />
              <div>
                <label className="mb-2 block font-bold">Country</label>
                <select
                  className="block w-full rounded-md border-2 border-[#bbbbbb] p-2"
                  value={selectedCountry || ""}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  required
                >
                  <option
                    value=""
                    disabled
                  >
                    -- Please select a Country --
                  </option>
                  {countries.map((country) => (
                    <option
                      key={country.value}
                      value={country.value}
                    >
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
            </InputGroupWithLabel>

            <div className="grid grid-cols-2 gap-4 rounded-lg px-4">
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "email",
                  required: true,
                  placeholder: "example@gmail.com",
                  name: "registerEmail",
                  register,
                  fieldRule: registerEmailRule,
                }}
                label={<span className="font-bold">Email</span>}
              />
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "number",
                  required: true,
                  placeholder: "9812345678",
                  name: "phone",
                  register,
                  fieldRule: phoneRule,
                }}
                label={<span className="font-bold">Phone</span>}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-lg px-4">
              <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputAttributes={{
                  type: "select",
                  options: userTypeOptions,
                  required: true,
                  placeholder: "Organization Type",
                  name: "userType",
                  register,
                  fieldRule: userTypeRule,
                }}
                label={<span className="font-bold">Organization Type</span>}
              />
              {/* <InputWithIcon
                useFormContext={useRegisterFormContext}
                iconElement={false}
                inputType="select"
                inputAttributes={{
                  required: true,
                  name: "productType",
                  ...register("productType", { required: "Product Type is required" }),
                }}
                label={<span className="font-bold">Product Type</span>}
              >
                <option value="">-- Select a Product Type --</option>
                {productTypes.map((productType) => (
                  <option
                    key={productType.name}
                    value={productType.name}
                  >
                    {productType.name}
                  </option>
                ))}
              </InputWithIcon> */}
            </div>

            {/* Password Input Group */}
            <InputGroupWithLabel
              cols={2}
              label={<span className="font-bold">Password</span>}
              requiredField
            >
              <div className="relative w-full max-w-[350px]">
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: isPasswordVisible ? "text" : "password",
                    required: true,
                    placeholder: "Password",
                    name: "registerPassword",
                    register,
                    fieldRule: {
                      ...registrationPasswordRule,
                      validate: (value) => {
                        if (watch("confirmRegisterPassword") !== value) {
                          setError("confirmRegisterPassword", { type: "custom", message: "passwords do not match" })

                          return "passwords do not match"
                        }

                        clearErrors(["registerPassword", "confirmRegisterPassword"])
                        return true
                      },
                    },
                  }}
                />
                <Button
                  className="absolute inset-y-0 right-0 flex h-full w-8 items-center justify-center px-2 text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? "👁️" : "🙈"}
                </Button>
              </div>
              <div className="relative mx-auto w-full max-w-[350px]">
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: isConfirmPasswordVisible ? "text" : "password",
                    required: true,
                    placeholder: "Confirm Password",
                    name: "confirmRegisterPassword",
                    register,
                    fieldRule: {
                      ...registrationConfirmPasswordRule,
                      validate: (value) => {
                        if (watch("registerPassword") !== value) {
                          setError("registerPassword", { type: "custom", message: "passwords do not match" })

                          return "passwords do not match"
                        }

                        clearErrors(["registerPassword", "confirmRegisterPassword"])
                        return true
                      },
                    },
                  }}
                />
                <Button
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-600"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {isConfirmPasswordVisible ? "👁️" : "🙈"}
                </Button>
              </div>
            </InputGroupWithLabel>

            <div className="w-full px-4 py-2 text-right">
              <Button
                type="submit"
                className="flex w-full items-center justify-center bg-purple-700 px-8 py-2 text-white hover:bg-purple-900"
                onClick={handleSubmit(submitFn)}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-gray-400"></span>
                ) : (
                  <span>Submit</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
