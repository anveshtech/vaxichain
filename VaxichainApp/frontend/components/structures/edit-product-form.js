"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../elements/button"
import axios from "axios"
import toast from "react-hot-toast"

export default function EditSingleProductForm({ params }) {
  const { "single-product": productId } = params
  const router = useRouter()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    productName: "",
    productSku: "",
    productPrice: "",
    productDescription: "",
    productAttributes: [],
    productStatus: process.env.PRODUCT_ITEM_STATUS_CANCELLED,
  })
  const [images, setImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([]) // To store image preview URLs
  const [removedImages, setRemovedImages] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  // Fetch product details
  useEffect(() => {
    async function fetchProductDetails() {
      if (!productId) return

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/products/getSingleProduct/${productId}`,
        )
        const productData = response.data.data

        setProduct(productData)
        setFormData({
          productName: productData.productName || "",
          productPrice: productData.productPrice || "",
          productDescription: productData.productDescription || "",
          productSku: productData.productSku || "",
          productWebLink: productData.productWebLink || "",
          productAttributes: productData.productAttributes || [],
          productStatus: productData.productStatus || "disabled",
        })
        setImages(productData.productImages || [])
      } catch (err) {
        console.error("Error fetching product details:", err)
        setError("Failed to fetch product details")
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [productId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "productPrice" ? value.replace(/[^0-9.]/g, "") : value, // Ensure only numbers and decimal points are allowed
    }))
  }
  const handleAttributeChange = (index, e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => {
      const updatedAttributes = [...prevFormData.productAttributes]
      updatedAttributes[index] = {
        ...updatedAttributes[index],
        [name]: value,
      }
      return {
        ...prevFormData,
        productAttributes: updatedAttributes,
      }
    })
  }
  const handleToggleChange = () => {
    if (formData.productStatus === "enabled") {
      setShowConfirmationModal(true)
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        productStatus: "enabled",
      }))
    }
  }
  const handleConfirmDisable = () => {
    setShowConfirmationModal(false) // Close the confirmation modal
    setShowModal(true) // Show the disabling note modal

    setFormData((prevFormData) => ({
      ...prevFormData,
      productStatus: "disabled",
    }))
  }
  const handleCancelDisable = () => {
    setShowConfirmationModal(false) // Close the confirmation modal
  }

  const getChangedFields = () => {
    const updatedFields = {}
    for (const key in formData) {
      if (key === "productAttributes") {
        const updatedAttributes = formData.productAttributes.map(
          (attr, index) =>
            attr.attributeName !== product.productAttributes[index]?.attributeName ||
            attr.attributeValue !== product.productAttributes[index]?.attributeValue,
        )

        if (updatedAttributes.includes(true)) {
          updatedFields.productAttributes = formData.productAttributes
        }
      } else if (formData[key] !== product?.[key] && formData[key] !== "") {
        updatedFields[key] = formData[key]
      }
    }
    return updatedFields
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    const previewUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previewUrls)
  }

  const handleImageRemove = (index, isExistingImage) => {
    if (isExistingImage) {
      setRemovedImages((prevRemoved) => [...prevRemoved, images[index]])
      setImages((prevImages) => prevImages.filter((_, imgIndex) => imgIndex !== index))
    } else {
      setImageFiles((prevFiles) => prevFiles.filter((_, fileIndex) => fileIndex !== index))
      setImagePreviews((prevPreviews) => prevPreviews.filter((_, previewIndex) => previewIndex !== index))
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()

    const updatedData = getChangedFields()
    if (!updatedData.productStatus) {
      updatedData.productStatus = process.env.PRODUCT_ITEM_STATUS_PENDING
    }

    if (updatedData.productPrice) {
      updatedData.productPrice = Number(updatedData.productPrice)
    }

    const formData = new FormData()
    for (const key in updatedData) {
      if (key === "productAttributes") {
        formData.append(key, JSON.stringify(updatedData[key]))
      } else {
        formData.append(key, updatedData[key])
      }
    }

    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages))
    }

    imageFiles.forEach((file) => {
      formData.append("productItems", file)
    })

    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/products/editProductDetails/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      toast.success("Product edited successfully")
      window.location.href = "/products"
      router.replace("/products")
    } catch (error) {
      console.error("Error submitting product update:", error)
      setError("Failed to update product")
      toast.error("Failed to update product")
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="rounded-lg bg-white p-4">
          <div className="mb-5 w-[15%]">
            <label className="font-bold">Product Status</label>
            <div className="flex items-center space-x-2 rounded-sm border border-[#616161] px-2 py-4">
              <span>Disabled</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.productStatus === "enabled"}
                  onChange={handleToggleChange}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-red-600 peer-checked:bg-purple-700 dark:bg-gray-700"></div>
                <span className="absolute inset-y-0 left-0 h-5 w-5 rounded-[1000px] bg-white transition-transform peer-checked:translate-x-5"></span>
              </label>
              <span>Enabled</span>
            </div>

            {showConfirmationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="rounded-lg bg-white p-4 shadow-md">
                  <h3 className="mb-2 text-center text-lg font-semibold">
                    Are you sure you want to disable the product?
                  </h3>
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      onClick={handleConfirmDisable}
                      className="rounded bg-red-600 px-4 py-2 text-white"
                    >
                      Yes
                    </button>
                    <button
                      onClick={handleCancelDisable}
                      className="rounded bg-gray-300 px-4 py-2 text-black"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="rounded-lg bg-white p-4 shadow-md">
                  <h3 className="mb-2 text-center text-lg font-semibold">
                    <u>Important Note</u>
                  </h3>
                  <p className="mt-2 text-base">Disabling a product will allow the product to hide from retailers.</p>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowModal(false)} // Close the modal
                      className="rounded bg-purple-700 px-4 py-2 text-white"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-5">
            <label className="font-bold">Product Name</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className="w-full rounded-sm border border-[#616161] px-2 py-4"
            />
          </div>
          <div className="mb-5 flex justify-between">
            <div className="w-[49%]">
              <label className="font-bold">Price</label>
              <input
                type="text"
                name="productPrice"
                value={formData.productPrice}
                onChange={handleChange}
                className="w-full rounded-sm border border-[#616161] px-2 py-4"
              />
            </div>
            <div className="w-[49%]">
              <label className="font-bold">SKU</label>
              <input
                type="text"
                name="productSku"
                value={formData.productSku}
                onChange={handleChange}
                className="w-full rounded-sm border border-[#616161] px-2 py-4"
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="font-bold">Product Weblink</label>
            <input
              type="text"
              name="productWebLink"
              value={formData.productWebLink}
              onChange={handleChange}
              className="w-full rounded-sm border border-[#616161] px-2 py-4"
            />
          </div>

          <div className="mb-5">
            <label className="font-bold">Description</label>
            <textarea
              name="productDescription"
              value={formData.productDescription}
              onChange={handleChange}
              className="w-full rounded-sm border border-[#616161] px-2 py-4"
            />
          </div>

          <div className="mb-5">
            <label className="font-bold">Attributes</label>
            {formData.productAttributes.map((attribute, index) => (
              <div
                key={attribute._id}
                className="mb-2 flex space-x-2"
              >
                <input
                  type="text"
                  name="attributeName"
                  value={attribute.attributeName}
                  onChange={(e) => handleAttributeChange(index, e)}
                  placeholder="Attribute Name"
                  className="w-1/7 rounded-sm border border-[#616161] px-2 py-4"
                  disabled
                />
                <input
                  type="text"
                  name="attributeValue"
                  value={attribute.attributeValue}
                  onChange={(e) => handleAttributeChange(index, e)}
                  placeholder="Attribute Value"
                  className="w-6/7 rounded-sm border border-[#616161] px-2 py-4"
                />
              </div>
            ))}
          </div>

          {/* Image upload section */}
          <div>
            <label className="font-bold">Upload New Images</label>
            <input
              type="file"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="w-full border px-2 py-1"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="bg-purple-700 px-8 py-2 text-white"
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Display uploaded and selected images */}
      <div className="mt-4">
        <h3>Current Images</h3>
        <div className="grid grid-cols-6 gap-2">
          {" "}
          {/* Adjusted grid for 6 columns */}
          {images.map((imageUrl, index) => {
            const correctedImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL_DEV}${imageUrl.replace(/\\/g, "/")}`
            return (
              <div
                key={index}
                className="relative"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/${imageUrl.replace(/\\/g, "/").replace("v1uploads", "v1/uploads")}`}
                  alt={`Product Image ${index}`}
                  className="h-20 w-20 rounded-md object-cover" // Adjusted image size and rounded
                />
                <button
                  className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500" // Adjusted position and styling
                  onClick={() => handleImageRemove(index, true)}
                >
                  &times;
                </button>
              </div>
            )
          })}
          {imagePreviews.map((previewUrl, index) => (
            <div
              key={index}
              className="relative"
            >
              <img
                src={previewUrl}
                alt={`New Image ${index}`}
                className="h-20 w-20 rounded-md object-cover" // Adjusted image size and rounded
              />
              <button
                className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500" // Adjusted position and styling
                onClick={() => handleImageRemove(index, false)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
