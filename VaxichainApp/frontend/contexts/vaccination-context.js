"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"

const VaccinationContext = React.createContext()

export const useVaccination = () => {
  const context = React.useContext(VaccinationContext)

  if (!context) {
    throw new Error("use useVaccination within the scope of VaccinationProvider")
  }

  return context
}

export default function VaccinationProvider({ children, vaccinationCenterId, childId }) {
  console.log("childId from vaccinationProvider", childId)
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
      { id: "vaccine-name", text: "Vaccine Name", dataKey: "vaccineName", width: "150px" },
      { id: "vaccine-company", text: "Vaccine Company", dataKey: "vaccineCompany", width: "150px" },
      { id: "vaccine-type", text: "Vaccine Type", dataKey: "vaccineType", width: "150px" },
      { id: "children-name", text: "Child Name", dataKey: "firstName", width: "150px" },
      { id: "guardian-name", text: "Guardian Name", dataKey: "guardianName", width: "150px" },
      { id: "guardian-phone", text: "Guardian Phone", dataKey: "guardianPhone", width: "150px" },

      {
        id: "createdDate",
        text: "Vaccinated Date",
        dataKey: "createdAt",
        width: "200px",
      },
    ],
  })
  const [selectedData, setSelectedData] = useState([])

  useEffect(() => {
    if (vaccinationCenterId && childId) {
      fetchVaccination(vaccinationCenterId, childId)
    }
  }, [vaccinationCenterId, childId, filters])

  const fetchVaccination = async (vaccinationCenterId, childId) => {
    console.log("child id from fetchVaccination", childId)
    setDataLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("Access token not found")
      }

      const query = new URLSearchParams(filters).toString()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/vaccination/getVaccination/${childId}?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      console.log("from vaccination context", response.data.data.vaccinations)
      setData((prev) => ({
        ...prev,
        vaccination: response?.data?.data?.vaccinations || [],
        pagination: response?.data?.data?.pagination,
      }))
    } catch (error) {
      console.error("Error fetching vaccination data:", error)
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
    <VaccinationContext.Provider
      value={{
        data,
        setData,
        sortData,
        selectedData,
        setSelectedData,
        fetchVaccination,
        dataLoading,
        setDataLoading,
        filters,
        setFilters,
      }}
    >
      {children}
    </VaccinationContext.Provider>
  )
}
