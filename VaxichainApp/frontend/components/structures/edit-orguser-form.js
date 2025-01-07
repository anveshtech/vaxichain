"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../elements/button"
import axios from "axios"
import toast from "react-hot-toast"

export default function EditOrgUser({ params }) {
  const { "single-orguser": orguserId } = params
  const router = useRouter()

  const [orguser, setOrgUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    address: {
      country: "",
      state: "",
      zip: "",
      city: "",
      addressLine: "",
    },
    phone: "",
    email: "",
  })

  useEffect(() => {
    async function fetchOrgUserDetails() {
      if (!orguserId) return

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/orguser/getSingleOrgUser/${orguserId}`,
        )
        const orguserData = response.data.data
        setOrgUser(orguserData)
        setFormData({
          fullName: `${orguserData.firstName || ""} ${orguserData.lastName || ""}`,

          address: {
            country: orguserData.address?.country || "",
            state: orguserData.address?.state || "",
            zip: orguserData.address?.zip || "",
            city: orguserData.address?.city || "",
            addressLine: orguserData.address?.addressLine || "",
          },
          phone: orguserData.phone || "",
          email: orguserData.email || "",
        })
      } catch (err) {
        console.error("Error fetching orguser details:", err)
        setError("Failed to fetch orguser details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrgUserDetails()
  }, [orguserId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      address: {
        ...prevFormData.address,
        [name]: value,
      },
    }))
  }

  const getChangedFields = () => {
    const updatedFields = {}

    for (const key in formData) {
      if (key === "address") {
        const mergedAddress = {
          ...orguser?.address,
          ...formData.address,
        }

        const updatedAddress = {}
        for (const addressKey in mergedAddress) {
          if (mergedAddress[addressKey] !== orguser?.address?.[addressKey] && mergedAddress[addressKey] !== "") {
            updatedAddress[addressKey] = mergedAddress[addressKey]
          }
        }

        if (Object.keys(updatedAddress).length > 0) {
          updatedFields.address = updatedAddress
        }
      } else if (formData[key] !== orguser?.[key] && formData[key] !== "") {
        updatedFields[key] = formData[key]
      }
    }

    return updatedFields
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const updatedData = getChangedFields()

    const [firstName, lastName] = formData.fullName.split(" ")

    if (formData.fullName !== `${orguser?.firstName} ${orguser?.lastName}`) {
      updatedData.firstName = firstName || ""
      updatedData.lastName = lastName || ""
    }

    updatedData.address = {
      ...orguser?.address,
      ...updatedData.address,
    }

    try {
      const accessToken = localStorage.getItem("accessToken")
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/orguser/editOrgUserDetails/${orguserId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      toast.success("orguser edited successfully")
      router.push(`/orgusers`)
    } catch (error) {
      setError("Failed to update orguser")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      {successMessage && <div className="mb-4 rounded bg-green-200 p-2 text-green-800">{successMessage}</div>}
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 rounded-lg bg-white p-6 shadow-md"
      >
        <h3 className="mt-6 text-lg font-bold text-gray-800">Personal Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="addressLine"
              value={formData.address.addressLine}
              onChange={handleAddressChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.address.city}
              onChange={handleAddressChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.address.country}
              onChange={handleAddressChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Zip Code <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="zip"
              value={formData.address.zip}
              onChange={handleAddressChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
        </div>

        <div className="text-right">
          <Button
            type="submit"
            disabled={saving}
            className="bg-purple-700 px-8 py-2 text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
