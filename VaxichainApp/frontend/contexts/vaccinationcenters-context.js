"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"

const VaccinationCenterContext = React.createContext()

export const userVaccinationCenter = () => {
  const context = React.useContext(VaccinationCenterContext)

  if (!context) {
    throw new Error("use userVaccinationCenter within the scope of VaccinationCenterProvider")
  }

  return context
}

export default function VaccinationCenterProvider({ children }) {
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
      {
        id: "vacinationCenter-name",
        text: "Vaccination Center",
        dataKey: "vaccinationCenterName",
        isSortable: true,
        width: "250px",
      },
      { id: "observer-name", text: "Observer Name", dataKey: "observerName", isSortable: true, width: "150px" },
      { id: "observer-phone", text: "Observer Phone", dataKey: "observerPhone", isSortable: true, width: "150px" },
      {
        id: "vaccination-status",
        text: "Vaccination Status",
        dataKey: "vaccinationCenterStatus",
        isSortable: true,
        width: "150px",
      },

      {
        id: "createdDate",
        text: "Created Date",
        dataKey: "createdAt",
        isSortable: true,
        width: "200px",
      },
    ],
  })
  const [selectedData, setSelectedData] = useState([])

  const fetchVaccinationCenters = async () => {
    setDataLoading(true)
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        throw new Error("Access token not found")
      }

      const query = new URLSearchParams(filters).toString()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/vaccinationCenter/getVaccinationCenter?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log("the response of vaccination center from context is", response.data.data.pagination)

      setData((prev) => ({
        ...prev,
        data: response?.data?.data?.vaccinationCenters || [],
        pagination: response?.data?.data?.pagination,
      }))
    } catch (error) {
      console.error("Error fetching companies data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    const debounceFetch = setTimeout(fetchVaccinationCenters, 300)
    return () => clearTimeout(debounceFetch)
  }, [filters])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)

    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  return (
    <VaccinationCenterContext.Provider
      value={{
        data,
        setData,
        sortData,
        selectedData,
        setSelectedData,
        fetchVaccinationCenters,
        dataLoading,
        setDataLoading,
        filters,
        setFilters,
      }}
    >
      {children}
    </VaccinationCenterContext.Provider>
  )
}
