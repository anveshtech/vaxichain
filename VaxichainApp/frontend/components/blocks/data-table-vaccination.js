import React, { useRef, useEffect, useState } from "react"
import Table from "./table"
import { twMerge } from "tailwind-merge"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import ImgWithWrapper from "../composites/img-with-wrapper"
import { useVaccination } from "@/contexts/vaccination-context"

export default function DataTable({ vaccinationCenterId, childId }) {
  const router = useRouter()
  const tableRef = useRef()
  const contextMenuRef = useRef()
  const [userRole, setUserRole] = useState("")

  const [loading, setLoading] = useState(false) // modal loader
  const {
    data,
    sortData,
    selectedData,
    setSelectedData,
    fetchVaccination,
    dataLoading,
    setDataLoading,
    filters,
    setFilters,
  } = useVaccination()

  const [currentPage, setCurrentPage] = useState(1)
  const seeData = data.pagination
  console.log("see data", seeData)
  const filteredData = data?.vaccination || []
  console.log(filteredData)
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

  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected._id === dataToVerify._id)
  }
  const isTableHeadingSelected = () => {
    return data.vaccination?.every((datum) => selectedData.some((eachSelected) => eachSelected._id === datum._id))
  }

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0 ? (prev.length < data.vaccination?.length ? [...data.vaccination] : []) : [...data.vaccination],
    )
  }

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev._id !== clickedData._id)
        : [...prev, clickedData],
    )
  }

  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, page: currentPage }))
  }, [currentPage])

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg">
        <Table
          className="w-full table-fixed border-collapse border-red-100"
          tableRef={tableRef}
        >
          <Table.Head className="bg-[#02235E] text-left text-white">
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
              {/* <Table.Heading
                className="pl-4"
                style={{ width: "100px" }}
              >
                Action
              </Table.Heading> */}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {dataLoading ? (
              <Table.Row>
                <Table.Column
                  colSpan={data.columns?.length + 1}
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
                    <span className="line-clamp-1">{datum.vaccineName}</span>
                  </Table.Column>

                  <Table.Column className="overflow-hidden p-2">
                    <span className="line-clamp-1">{datum.vaccineCompany}</span>
                  </Table.Column>
                  <Table.Column className="overflow-hidden p-2">
                    <span className="line-clamp-1">{datum.vaccineType}</span>
                  </Table.Column>
                  <Table.Column className="overflow-hidden p-2">
                    <span className="line-clamp-1">{datum.childDetails?.firstName}</span>
                  </Table.Column>
                  <Table.Column className="overflow-hidden p-2">
                    <span className="line-clamp-1">{datum.childDetails?.guardianName}</span>
                  </Table.Column>
                  <Table.Column className="overflow-hidden p-2">
                    <span className="line-clamp-1">{datum.childDetails?.guardianPhone}</span>
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

                  {/* <Table.Column className="p-2">
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
                        <>
                          <ContextMenu.Item
                            className="rounded-md bg-[#0000CC]"
                            onClick={() =>
                              router.push(`/vaccinationcenters/${vaccinationCenterId}/children/${datum._id}/edit`)
                            }
                          >
                            Edit
                          </ContextMenu.Item>
                        </>
                      </ContextMenu.Menu>
                    </ContextMenu>
                  </Table.Column> */}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
      <div className="text-right">
        <Pagination
          totalNumberOfData={data?.pagination?.totalVaccinations || 0}
          numberOfDataPerPage={filters.limit}
          currentPage={currentPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      </div>
    </div>
  )
}
