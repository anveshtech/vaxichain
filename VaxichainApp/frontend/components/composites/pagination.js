import React from "react"

export default function Pagination({ numberOfDataPerPage = 2, totalNumberOfData, currentPage, onPageChange }) {
  const totalPages = Math.ceil(totalNumberOfData / numberOfDataPerPage)
  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1)

  return (
    <>
      Page{" "}
      <select
        className="rounded-sm border-2 border-black outline-none"
        value={currentPage}  // bind to the currentPage state
        onChange={(e) => onPageChange(Number(e.target.value))}  // trigger onPageChange when page changes
      >
        {pageNumbers.map((pageNumber, idx) => (
          <option key={idx} value={pageNumber}>
            {pageNumber}
          </option>
        ))}
      </select>{" "}
      of {totalPages}
    </>
  )
}
