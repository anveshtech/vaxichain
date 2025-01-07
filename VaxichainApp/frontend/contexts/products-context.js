"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

import { fetchProducts } from "./query-provider/api-request-functions/api-requests"

const ProductsContext = createContext()

export const useProducts = () => {
  const context = useContext(ProductsContext)

  if (!context) {
    throw new Error("use useProductsContext within the context of ProductsProvider")
  }

  return context
}

export default function ProductsProvider({ children, companyId }) {
  const [isAsc, setIsAsc] = useState(false)
  const [selectedData, setSelectedData] = useState([])
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    batchIdSearch: "",
  })
  const loadProducts = async () => {
    setLoading(true)
    setDataLoading(true)
    try {
      const response = await fetchProducts({ companyId, filters })

      setProducts(response.data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
      setDataLoading(false)
    }
  }
  useEffect(() => {
    loadProducts()
  }, [filters, companyId])

  const [columns, setColumns] = useState([
    {
      id: "blockChainVerified",
      text: "BC Verification",
      dataKey: "blockChainVerified",
      isSortable: false,
      width: "150px",
    },
    {
      id: "product-name",
      text: "Product Name",
      dataKey: "productName",
      isSortable: true,
      width: "150px",
    },
    {
      id: "company-manufacturer",
      text: "Manufacturer",
      dataKey: "companymanufacturer",
      isSortable: true,
      width: "150px",
    },
    {
      id: "product-price",
      text: "Price",
      dataKey: "productPrice",
      isSortable: true,
      width: "100px",
    },
    {
      id: "product-sku",
      text: "SKU",
      dataKey: "productSku",
      isSortable: false,
      width: "100px",
    },
    {
      id: "batchId",
      text: "Batch",
      dataKey: "batchid",
      isSortable: true,
      width: "150px",
    },
    { id: "product-status", text: "Status", dataKey: "status", isSortable: true, width: "100px" },
    { id: "createdAt", text: "Created Date", dataKey: "createdAt", isSortable: true, width: "150px" },
    { id: "qr-code", text: "QR Code", dataKey: "qr-code", isSortable: false, width: "80px" },
    { id: "purchasedStatus", text: "Available", dataKey: "purchasedStatus", isSortable: true, width: "100px" },
  ])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev) // Toggle ascending/descending flag
    const dataCopy = [...products.productItems]
    const sortedData = dataCopy.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setProducts({
      ...products,
      productItems: sortedData,
    })
  }

  return (
    <ProductsContext.Provider
      value={{
        isAsc,
        products,
        setProducts,
        columns,
        sortData,
        selectedData,
        setSelectedData,
        filters,
        setFilters,
        loadProducts,
        dataLoading,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}
