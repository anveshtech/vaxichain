"use client"

import React, { useState } from "react"
import axios from "axios"
import Button from "../elements/button"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function AddOrgUserFormTemplate() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    status: "enabled",
    address: {
      zip: "",
      city: "",
      country: "",
      addressLine: "",
    },
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("address.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        toast.error("Access token not found. Please log in again.")
        return
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/createOrganizationUsers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      toast.success("User added successfully!")

      // Reset the form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        status: "enabled",
        address: {
          zip: "",
          city: "",
          country: "",
          addressLine: "",
        },
      })

      router.push("/orgusers")
      console.log("Response:", response.data)
    } catch (error) {
      toast.error("Failed to add user. Please try again.")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      <h3 className="mt-6 text-lg font-bold text-gray-800">Personal Information</h3>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name <span className="text-red-600">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name <span className="text-red-600">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password <span className="text-red-600">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status <span className="text-red-600">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          >
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      <h3 className="mt-6 text-lg font-bold text-gray-800">Address</h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="addressLine"
            className="block text-sm font-medium text-gray-700"
          >
            Address Line <span className="text-red-600">*</span>
          </label>
          <input
            id="addressLine"
            name="address.addressLine"
            type="text"
            value={formData.address.addressLine}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City <span className="text-red-600">*</span>
          </label>
          <input
            id="city"
            name="address.city"
            type="text"
            value={formData.address.city}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="zip"
            className="block text-sm font-medium text-gray-700"
          >
            ZIP Code <span className="text-red-600">*</span>
          </label>
          <input
            id="zip"
            name="address.zip"
            type="number"
            value={formData.address.zip}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country <span className="text-red-600">*</span>
          </label>
          <input
            id="country"
            name="address.country"
            type="text"
            value={formData.address.country}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
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
  )
}
