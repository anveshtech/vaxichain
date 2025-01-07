"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../elements/button"
import axios from "axios"
import toast from "react-hot-toast"

export default function EditDataCollector({ params }) {
  const { "single-datacollector": datacollectorId } = params
  const router = useRouter()

  const [datacollector, setDatacollector] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    address: {
      country: "",
      state: "",
      zip: "",
      city: "",
      addressLine: "",
    },
    phoneNumber: "",
    email: "",
  })

  useEffect(() => {
    async function fetchDataCollectorDetails() {
      if (!datacollectorId) return

      try {
        const accessToken = localStorage.getItem("accessToken")
        if (!accessToken) {
          throw new Error("Access token not found")
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/datacollector/getSingleDataCollector/${datacollectorId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        const datacollectorData = response.data.data

        setDatacollector(datacollectorData)
        setFormData({
          fullName: `${datacollectorData.firstName || ""} ${datacollectorData.lastName || ""}`,
          companyName: datacollectorData.companyName || "",

          address: {
            country: datacollectorData.address?.country || "",
            state: datacollectorData.address?.state || "",
            zip: datacollectorData.address?.zip || "",
            city: datacollectorData.address?.city || "",
            addressLine: datacollectorData.address?.addressLine || "",
          },
          phoneNumber: datacollectorData.phoneNumber || "",
          email: datacollectorData.email || "",
        })
      } catch (err) {
        console.error("Error fetching datacollector details:", err)
        setError("Failed to fetch datacollector details")
      } finally {
        setLoading(false)
      }
    }

    fetchDataCollectorDetails()
  }, [datacollectorId])

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
          ...datacollector?.address,
          ...formData.address,
        }

        const updatedAddress = {}
        for (const addressKey in mergedAddress) {
          if (mergedAddress[addressKey] !== datacollector?.address?.[addressKey] && mergedAddress[addressKey] !== "") {
            updatedAddress[addressKey] = mergedAddress[addressKey]
          }
        }

        if (Object.keys(updatedAddress).length > 0) {
          updatedFields.address = updatedAddress
        }
      } else if (formData[key] !== datacollector?.[key] && formData[key] !== "") {
        updatedFields[key] = formData[key]
      }
    }

    return updatedFields
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedData = getChangedFields()

    const [firstName, lastName] = formData.fullName.split(" ")

    if (formData.fullName !== `${datacollector?.firstName} ${datacollector?.lastName}`) {
      updatedData.firstName = firstName || ""
      updatedData.lastName = lastName || ""
    }

    updatedData.address = {
      ...datacollector?.address,
      ...updatedData.address,
    }

    try {
      setSaving(true)
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        throw new Error("Access token not found while editing")
      }
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/datacollector/editDataCollectorDetails/${datacollectorId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      toast.success("datacollector edited sucessfully")
      router.push(`/datacollectors`)
    } catch (error) {
      setError("Failed to update datacollector")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 rounded-lg bg-white p-6 shadow-md"
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Collector Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line</label>
            <input
              type="text"
              name="addressLine"
              value={formData.address.addressLine}
              onChange={handleAddressChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.address.city}
              onChange={handleAddressChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={formData.address.country}
              onChange={handleAddressChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Zip Code</label>
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
            className="rounded-md bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
