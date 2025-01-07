"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"
import Button from "../elements/button"

export default function EditChildrenForm({ childId, vaccinationCenterId }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: {
      location: "",
      wardNo: "",
      municipality: "",
    },
    guardianDetails: {
      guardianName: "",
      guardianPhone: "",
    },
    age: "",
    gender: "girl",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchChildDetails() {
      try {
        const accessToken = localStorage.getItem("accessToken")
        if (!accessToken) {
          throw new Error("Access token not found")
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/children/getChildrenById/${vaccinationCenterId}/${childId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        const childData = response?.data?.data?.child
        setFormData({
          firstName: childData.firstName || "",
          lastName: childData.lastName || "",
          address: {
            location: childData.address?.location || "",
            wardNo: childData.address?.wardNo || "",
            municipality: childData.address?.municipality || "",
          },
          guardianDetails: {
            guardianName: childData.guardianDetails?.guardianName || "",
            guardianPhone: childData.guardianDetails?.guardianPhone || "",
          },
          age: childData.age || "",
          gender: childData.gender || "girl",
        })
      } catch (err) {
        console.error("Error fetching child details:", err)
        setError("Failed to fetch child details")
      } finally {
        setLoading(false)
      }
    }

    fetchChildDetails()
  }, [childId])

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
    } else if (name.startsWith("guardianDetails.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        guardianDetails: {
          ...prev.guardianDetails,
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

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/children/editChildren/${vaccinationCenterId}/${childId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      toast.success("Child updated successfully!")
      router.push(`/vaccinationcenters/${vaccinationCenterId}/children`)
      console.log("Response:", response.data)
    } catch (error) {
      toast.error("Failed to update child. Please try again.")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      <h3 className="mt-6 text-lg font-bold text-gray-800">Child Information</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="municipality"
            className="block text-sm font-medium text-gray-700"
          >
            Municipality
          </label>
          <input
            id="municipality"
            name="address.municipality"
            type="text"
            value={formData.address.municipality}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
      </div>

      <h3 className="mt-6 text-lg font-bold text-gray-800">Address</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            id="location"
            name="address.location"
            type="text"
            value={formData.address.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="wardNo"
            className="block text-sm font-medium text-gray-700"
          >
            Ward Number
          </label>
          <input
            id="wardNo"
            name="address.wardNo"
            type="number"
            value={formData.address.wardNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
      </div>

      <h3 className="mt-6 text-lg font-bold text-gray-800">Guardian Details</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="guardianName"
            className="block text-sm font-medium text-gray-700"
          >
            Guardian Name
          </label>
          <input
            id="guardianName"
            name="guardianDetails.guardianName"
            type="text"
            value={formData.guardianDetails.guardianName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="guardianPhone"
            className="block text-sm font-medium text-gray-700"
          >
            Guardian Phone
          </label>
          <input
            id="guardianPhone"
            name="guardianDetails.guardianPhone"
            type="tel"
            value={formData.guardianDetails.guardianPhone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700"
          >
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          >
            <option value="girl">Female</option>
            <option value="boy">Male</option>
          </select>
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
