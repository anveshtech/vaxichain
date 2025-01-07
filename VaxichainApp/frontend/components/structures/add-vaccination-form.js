"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import Button from "../elements/button"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function AddVaccinationForm({ vaccinationCenterId, childId }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    vaccineName: "",
    vaccineCompany: "",
    vaccinatedDate: "",
    vaccineType: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0] // Get today's date in YYYY-MM-DD format
    setFormData((prev) => ({ ...prev, vaccinatedDate: today }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/vaccination/createVaccination/${childId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      toast.success("Vaccination record added successfully!")

      // Reset the form
      setFormData({
        vaccineName: "",
        vaccineCompany: "",
        vaccinatedDate: formData.vaccinatedDate,
        vaccineType: "",
      })

      router.push(`/vaccinationcenters/${vaccinationCenterId}/children/${childId}/vaccination`)
    } catch (error) {
      toast.error("Failed to add vaccination record. Please try again.")
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
      <h3 className="mt-6 text-lg font-bold text-gray-800">Vaccination Details</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="vaccineName"
            className="block text-sm font-medium text-gray-700"
          >
            Vaccine Name
          </label>
          <input
            id="vaccineName"
            name="vaccineName"
            type="text"
            value={formData.vaccineName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="vaccineCompany"
            className="block text-sm font-medium text-gray-700"
          >
            Vaccine Company
          </label>
          <input
            id="vaccineCompany"
            name="vaccineCompany"
            type="text"
            value={formData.vaccineCompany}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="vaccinatedDate"
            className="block text-sm font-medium text-gray-700"
          >
            Vaccinated Date
          </label>
          <input
            id="vaccinatedDate"
            name="vaccinatedDate"
            type="date"
            value={formData.vaccinatedDate}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="vaccineType"
            className="block text-sm font-medium text-gray-700"
          >
            Vaccine Type
          </label>
          <input
            id="vaccineType"
            name="vaccineType"
            type="text"
            value={formData.vaccineType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 p-2"
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
