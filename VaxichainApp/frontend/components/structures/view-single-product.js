"use client"

import { fetchSingleProductWithSlug } from "@/contexts/query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import { currencyFormat } from "@/utils/functionalUtils"
import LoadingAnimation from "../composites/loading-animation"

export default function ViewSingleProduct() {
  const params = useParams()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const singleProductQuery = useQuery({
    queryKey: ["fetchSinglProduct", params["single-product"]],
    queryFn: () => fetchSingleProductWithSlug(params["single-product"]),
    staleTime: reactQueryStaleTime,
  })

  const productData = singleProductQuery.data?.data

  const productImages = productData?.productImages || []

  const currentImage =
    productImages.length > 0 && productImages[currentImageIndex]
      ? `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/${productImages[currentImageIndex].replace(/\\/g, "/")}`
      : null

  const handlePrevImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + productImages.length) % productImages.length)
    }
  }

  const handleNextImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productImages.length)
    }
  }

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <div className="lg:w-1/2">
          {productImages.length > 0 && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handlePrevImage}
                className="rounded-full bg-gray-300 p-2 hover:bg-gray-400"
              >
                &#8592;
              </button>

              <img
                src={currentImage}
                alt={`Product image ${currentImageIndex + 1}`}
                className="h-[300px] w-3/4 rounded-md object-cover md:h-[400px] lg:h-[500px]"
              />

              <button
                onClick={handleNextImage}
                className="rounded-full bg-gray-300 p-2 hover:bg-gray-400"
              >
                &#8594;
              </button>
            </div>
          )}
        </div>
        <div className="lg:w-1/2">
          <div className="my-5">
            <p className="text-sm text-[#7f7f7f]">Batch Id: {productData?.batchId?.batchId || "N/A"}</p>
            <h1 className="text-2xl font-bold text-purple-700 md:text-4xl lg:text-5xl">{productData?.productName}</h1>
            <p className="text-sm text-[#7f7f7f]">Product SKU: {productData?.productSku}</p>
          </div>
          <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Price: <span className="font-normal">{currencyFormat(productData?.productPrice)}</span>
              </p>
            </div>
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Product Type:{" "}
                <span className="font-normal">
                  {productData?.productType?.map((type) => type.name).join(", ") || "N/A"}
                </span>
              </p>
            </div>
          </div>
          <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Product Status: <span className="font-normal">{productData?.productStatus}</span>
              </p>
            </div>
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Manufacturer: <span className="font-normal">{productData?.productManufacturer?.companyName}</span>
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-white px-4 py-4">
            <p className="font-bold">Product Weblink</p>
            {productData?.productWebLink ? (
              <a
                href={productData.productWebLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {productData.productWebLink}
              </a>
            ) : (
              <p className="text-[#7f7f7f]">N/A</p>
            )}
          </div>
        </div>
      </div>

      <div className="my-2 rounded-lg bg-white px-4 py-4">
        <p className="text-lg font-bold">Detailed Description</p>
        <p
          className="text-black"
          dangerouslySetInnerHTML={{ __html: productData?.productDescription }}
        ></p>
      </div>

      <div className="my-2 rounded-lg bg-white px-4 py-4">
        <p className="text-lg font-bold">Product Attributes</p>
        {productData?.productAttributes.map((eachAttribute) => (
          <div
            className="flex flex-wrap gap-4"
            key={eachAttribute._id}
          >
            <p className="w-full font-bold md:w-52">{eachAttribute.attributeName}</p>
            <p className="text-sm text-[#7f7f7f]">{eachAttribute.attributeValue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
