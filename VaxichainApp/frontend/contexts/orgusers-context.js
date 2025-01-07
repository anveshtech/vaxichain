"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"

const OrgUsersContext = React.createContext()

export const useOrgUsers = () => {
  const context = React.useContext(OrgUsersContext)

  if (!context) {
    throw new Error("use useOrgUsers within the scope of Orguser provider")
  }

  return context
}

export default function OrgUsersProvider({ children }) {
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

      { id: "OrganizationUser Name", text: "Name", dataKey: "name", isSortable: true, width: "150px" },
      {
        id: "Phone number",
        text: "Phone",
        dataKey: "phone",
        isSortable: false,
        width: "150px",
      },
      {
        id: "Email",
        text: "Email",
        dataKey: "email",
        isSortable: false,
        width: "250px",
      },

      { id: "orguser-status", text: "Status", dataKey: "status", isSortable: true, width: "120px" },
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

  const fetchOrgUsers = async () => {
    setDataLoading(true)
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        throw new Error("Access token not found")
      }
      const query = new URLSearchParams(filters).toString()
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/orguser/getOrgUsers?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setData((prev) => ({
        ...prev,
        data: response?.data?.data?.organizationUsers || [],
        pagination: response?.data?.data?.pagination || [],
      }))
    } catch (error) {
      console.error("Error fetching orgusers data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    const debounceFetch = setTimeout(fetchOrgUsers, 300)
    return () => clearTimeout(debounceFetch)
  }, [filters])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)

    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  return (
    <OrgUsersContext.Provider
      value={{
        data,
        setData,
        sortData,
        selectedData,
        setSelectedData,
        filters,
        setFilters,
        fetchOrgUsers,
        dataLoading,
        setDataLoading,
      }}
    >
      {children}
    </OrgUsersContext.Provider>
  )
}
