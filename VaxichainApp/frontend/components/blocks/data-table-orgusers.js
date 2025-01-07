import React, { useRef, useEffect, useState } from "react"
import Table from "./table"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"

import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import ContextMenu from "./context-menu"
import { useRouter } from "next/navigation"
import axios from "axios"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import ImgWithWrapper from "../composites/img-with-wrapper"
import { useOrgUsers } from "@/contexts/orgusers-context"

const DisableModal = ({ isOpen, onClose, onSubmit, orguser, loading }) => {
  const [remarks, setRemarks] = useState("")

  const handleDisableSubmit = () => {
    onSubmit(orguser, remarks)
    setRemarks("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[30rem] rounded-md bg-white p-6 shadow-lg">
        {/* Increased width and padding */}
        <h2 className="text-lg font-bold">Disable orguser</h2>
        <p className="mt-2">Please provide a reason for disabling the orguser:</p>
        <textarea
          className="mt-2 w-full rounded-md border p-2"
          rows="8"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
        ></textarea>
        <div className="mt-2 flex justify-between">
          <div className="flex">
            <button
              className="rounded-md bg-gray-300 px-4 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          <div className="flex">
            <button
              className={`rounded-md bg-red-500 px-4 py-2 text-white ${loading ? "cursor-not-allowed bg-gray-400" : "bg-green-500"}`}
              onClick={handleDisableSubmit}
              disabled={loading}
            >
              {loading ? "Loading" : "Disable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
const ApprovalModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[20rem] rounded-md bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold">Approve orguser</h2>
        <p className="mt-2">Do you want to approve this orguser?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="rounded-md bg-red-600 px-4 py-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`rounded-md px-4 py-2 text-white ${loading ? "cursor-not-allowed bg-gray-400" : "bg-green-500"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Loading..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DataTable() {
  const router = useRouter()
  const tableRef = useRef()
  const contextMenuRef = useRef()
  const [userRole, setUserRole] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orgUserToDisable, setOrgUserToDisable] = useState(null) // Track which orguser to disable
  const [orgUserToApprove, setOrgUserToApprove] = useState(null)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [loading, setLoading] = useState(false) // modal loader
  const {
    data,
    sortData,
    selectedData,
    setSelectedData,
    fetchOrgUsers,
    dataLoading,
    setDataLoading,
    filters,
    setFilters,
  } = useOrgUsers()

  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = data?.data

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setUserRole(user.data.userType)
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])
  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, page: currentPage }))
  }, [currentPage])
  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected.companyName === dataToVerify.companyName)
  }

  const isTableHeadingSelected = () => {
    return data.data?.every((datum) =>
      selectedData.some((eachSelected) => eachSelected.companyName === datum.companyName),
    )
  }

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0 ? (prev.length < data.data.length ? [...data.data] : []) : [...data.data],
    )
  }

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev.companyName !== clickedData.companyName)
        : [...prev, clickedData],
    )
  }

  const handleApprove = async () => {
    setLoading(true)
    const updatedOrgUser = { ...orgUserToApprove, status: "enabled" }

    try {
      await updateOrgUserStatus(orgUserToApprove.id, updatedOrgUser)
      await fetchOrgUsers()
      setIsApprovalModalOpen(false)
    } catch (error) {
      console.error("Failed to approve orguser:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = (orguser) => {
    setOrgUserToDisable(orguser)
    setIsModalOpen(true) // Open modal
  }
  const handleSubmitDisable = async (orguser, remarks) => {
    setLoading(true)
    const updatedOrgUser = { ...orguser, status: "disabled", remarks }

    try {
      await updateOrgUserStatus(orguser.id, updatedOrgUser)
      await fetchOrgUsers()
    } catch (error) {
      console.error("Failed to disable orguser:", error)
    } finally {
      setLoading(false)
    }
  }
  const updateOrgUserStatus = async (id, updatedOrgUser) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/get-companies/${id}`,
        updatedOrgUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      return response.data
    } catch (error) {
      console.error("Error updating orguser status:", error.response?.data || error.message)
      throw new Error("Failed to update orguser status")
    }
  }
  const handleDelete = async (orguserId) => {
    if (window.confirm("Are you sure you want to delete this orguser?")) {
      try {
        await deleteOrgUser(orguserId)
        await fetchOrgUsers()
      } catch (error) {
        console.error("Failed to delete orguser:", error)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg">
        <Table
          className="w-full table-fixed border-collapse border-red-100"
          tableRef={tableRef}
        >
          <Table.Head className="bg-purple-700 text-left text-white">
            <Table.Row className="h-[48px]">
              <Table.Heading
                className="pl-4"
                style={{ width: "50px" }}
              >
                <Checkbox
                  onChange={handleTableHeadingCheckboxChange}
                  checked={isTableHeadingSelected()}
                />
              </Table.Heading>
              {data.columns?.map((column) => (
                <Table.Heading
                  className={twMerge("px-2")}
                  key={column.id}
                  dataKey={column.dataKey}
                  isSortable={column.isSortable}
                  sortData={sortData}
                  style={{ width: column.width ?? "" }}
                >
                  {column.text}
                </Table.Heading>
              ))}
              <Table.Heading
                className="pl-4"
                style={{ width: "100px" }}
              >
                Action
              </Table.Heading>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {dataLoading ? (
              <Table.Row>
                <Table.Column
                  colSpan={data.columns?.length + 2}
                  className="py-8 text-center"
                >
                  <div className="inline-block size-8 animate-spin border-4 border-black" />
                </Table.Column>
              </Table.Row>
            ) : (
              filteredData?.map((datum, idx) => (
                <Table.Row
                  key={idx}
                  className="border-b border-b-[#605E5E] bg-white"
                >
                  <Table.Column className="px-4 py-2">
                    <Checkbox
                      onChange={() => handleTableDataCheckboxChange(datum)}
                      checked={isTableDataSelected(datum)}
                    />
                  </Table.Column>
                  <Table.Column className="px-8">
                    <ImgWithWrapper
                      wrapperClassName="size-10 mx-15"
                      imageClassName="object-contain object-left"
                      imageAttributes={{
                        src:
                          datum?.blockChainVerified === "pending"
                            ? "/assets/Pending.png"
                            : datum?.blockChainVerified
                              ? "/assets/Verified2.png"
                              : "/assets/Unverified.png",
                        alt:
                          datum?.blockChainVerified === "pending"
                            ? "Pending Logo"
                            : datum?.blockChainVerified
                              ? "Verified Logo"
                              : "Unverified Logo",
                      }}
                    />
                  </Table.Column>

                  <Table.Column className="p-2">
                    <span className="line-clamp-1">
                      {datum.firstName} {datum.lastName}
                    </span>
                  </Table.Column>
                  <Table.Column className="overflow-hidden p-2">
                    <span className="line-clamp-1">{datum.phone}</span>
                  </Table.Column>
                  <Table.Column className="overflow-hidden p-2">
                    <span className="line-clamp-1">{datum.email}</span>
                  </Table.Column>

                  <Table.Column className="p-2">
                    <span
                      className={twMerge(
                        "rounded-full px-2 py-1 text-white",
                        datum.status === "disabled"
                          ? "bg-red-500"
                          : datum.status === "verified" || datum.status === "enabled"
                            ? "bg-green-600"
                            : "bg-gray-500",
                      )}
                    >
                      {datum.status}
                    </span>
                  </Table.Column>
                  <Table.Column className="p-2">
                    {new Date(datum.createdAt).toLocaleString("eng-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      hour12: true,
                    })}
                  </Table.Column>

                  <Table.Column className="p-2">
                    <ContextMenu
                      className="relative"
                      tableRef={tableRef}
                      contextMenuRef={contextMenuRef}
                    >
                      <ContextMenu.Trigger>
                        <FontAwesomeIcon
                          icon={faEllipsisVertical}
                          className="fa-fw"
                        />
                      </ContextMenu.Trigger>
                      <ContextMenu.Menu
                        className="absolute z-10 w-[175px] space-y-1 text-white"
                        contextMenuRef={contextMenuRef}
                      >
                        {userRole === "dataCollector" && (
                          <>
                            <ContextMenu.Item
                              className="rounded-md bg-purple-900"
                              onClick={() => router.push(`/orgusers/${datum.id}/edit`)}
                            >
                              Edit
                            </ContextMenu.Item>

                            <ContextMenu.Item
                              className="rounded-md bg-purple-900"
                              onClick={() => {
                                setOrgUserToApprove(datum)
                                setIsApprovalModalOpen(true)
                              }}
                            >
                              Approve
                            </ContextMenu.Item>
                            {/* <ContextMenu.Item
                            className="rounded-md bg-purple-700"
                            onClick={() => router.push(`/companies/${datum.id}/edit`)}
                          >
                            Edit
                          </ContextMenu.Item> */}
                          </>
                        )}
                      </ContextMenu.Menu>
                    </ContextMenu>
                  </Table.Column>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
      <div className="text-right">
        <Pagination
          totalNumberOfData={data?.pagination?.totalUsers || 0}
          numberOfDataPerPage={filters.limit}
          currentPage={currentPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      </div>
      <DisableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitDisable}
        orguser={orgUserToDisable}
        loading={loading}
      />
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={handleApprove}
        loading={loading}
      />
    </div>
  )
}
