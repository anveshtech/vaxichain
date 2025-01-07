import React, { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

export default function CustomerFormModal({
  show,
  onClose,
  onSave,
  currentUserId,
  productId,
  productStatus,
  customerInfo,
}) {
  const [formData, setFormData] = useState({ name: "", email: "", phoneNumber: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (show) {
      if (!customerInfo || productStatus === "pending") {
        setFormData({ name: "", email: "", phoneNumber: "" })
      } else if (customerInfo && customerInfo.message) {
        setFormData({
          name: customerInfo.message.name || "",
          email: customerInfo.message.email || "",
          phoneNumber: customerInfo.message.phoneNumber || "",
        })
      }
    }
  }, [customerInfo, productStatus, show])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const dataToSend = {
      ...formData,
      soldBy: currentUserId, // Set soldBy to the current user ID
      soldProducts: productId, // Set soldProducts to the selected product ID
    }

    setLoading(true)
    setError(null) // Clear any previous error

    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/createCustomer`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )
      if (response.data?.status === 204) {
        toast.info(response.data.message)
        setError(response.data.message)
      } else {
        onSave("completed", productId)
        setFormData({ name: "", email: "", phoneNumber: "" })
        toast.success("Customer added successfully")
        onClose()
      }
    } catch (error) {
      console.error("Error saving customer:", error)
      setError(error.response?.data?.message || "Failed to save customer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: "", email: "", phoneNumber: "" }) // Reset form data when closing
    setError(null) // Reset the error state
    onClose()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">
          {productStatus === "completed" ? "Edit Customer Details" : "Enter Customer Details"}
        </h2>
        {error && <p className="mb-4 text-red-500">{error}</p>} {/* Display error if present */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="rounded-md bg-gray-500 px-4 py-2 text-white"
              onClick={handleClose} // Call handleClose instead of onClose directly
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-purple-700 px-4 py-2 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
