"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"

const ChildrenContext = React.createContext()

export const useChildren = () => {
  const context = React.useContext(ChildrenContext)

  if (!context) {
    throw new Error("use useChildren within the scope of ChildrenProvider")
  }

  return context
}

export default function ChildrenProvider({ children, vaccinationCenterId }) {
  const router = useRouter()
  const [isAsc, setIsAsc] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [filters, setFilters] = useState({
    limit: 10,
    page: 1,
  })

  const [data, setData] = useState({
    data: [],
    columns: [
      {
        id: "blockChainVerified",
        text: "BC Verification",
        dataKey: "blockChainVerified",
        isSortable: false,
        width: "150px",
      },
      { id: "child-name", text: "Child Name", dataKey: "name", width: "150px" },
      { id: "child-location", text: "Location", dataKey: "location", width: "150px" },
      { id: "guardian-name", text: "Guardian Name", dataKey: "guardianName", width: "150px" },
      { id: "guardian-phone", text: "Guardian Phone", dataKey: "guardianPhone", width: "150px" },
      { id: "child-age", text: "Age", dataKey: "age", width: "150px" },
      { id: "child-gender", text: "Gender", dataKey: "gender", width: "150px" },
      {
        id: "createdDate",
        text: "Created Date",
        dataKey: "createdAt",
        width: "200px",
      },
    ],
  })
  const [selectedData, setSelectedData] = useState([])

  useEffect(() => {
    if (vaccinationCenterId) {
      fetchChildren(vaccinationCenterId)
    }
  }, [vaccinationCenterId, filters])

  const fetchChildren = async (vaccinationCenterId) => {
    setDataLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("Access token not found")
      }

      const query = new URLSearchParams(filters).toString()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/children/getChildren/${vaccinationCenterId}?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      console.log("from children context", response.data.data.pagination)
      setData((prev) => ({
        ...prev,
        children: response?.data?.data?.children || [],
        pagination: response?.data?.data?.pagination,
      }))
    } catch (error) {
      console.error("Error fetching children data:", error)
    } finally {
      setDataLoading(false)
    }
  }
  const sortData = (basis) => {
    setIsAsc((prev) => !prev)

    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  return (
    <ChildrenContext.Provider
      value={{
        data,
        setData,
        sortData,
        selectedData,
        setSelectedData,
        fetchChildren,
        dataLoading,
        setDataLoading,
        filters,
        setFilters,
      }}
    >
      {children}
    </ChildrenContext.Provider>
  )
}
