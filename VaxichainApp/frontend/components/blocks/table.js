"use client"

import { faArrowDownLong, faArrowUpLong } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { twMerge } from "tailwind-merge"

export default function Table({ children, tableRef, ...props }) {
  return (
    <table
      ref={tableRef}
      {...props}
    >
      {children}
    </table>
  )
}

Table.Head = ({ children, ...props }) => <thead {...props}>{children}</thead>

Table.Body = ({ children, ...props }) => <tbody {...props}>{children}</tbody>

Table.Heading = ({ children, className, sortData, isSortable, dataKey, ...props }) => {
  if (isSortable && !dataKey) throw new Error("sortable heading require datakey to connect to the data to sort")

  return (
    <th
      className={className}
      onClick={isSortable ? () => sortData(dataKey) : () => null}
      {...props}
    >
      <div className={twMerge("flex w-full items-center gap-2", isSortable ? "cursor-pointer" : "")}>
        {children}

        {isSortable && (
          <span>
            <FontAwesomeIcon
              icon={faArrowUpLong}
              className="-mr-0.5"
            />
            <FontAwesomeIcon
              icon={faArrowDownLong}
              className="-ml-0.5"
            />
          </span>
        )}
      </div>
    </th>
  )
}

Table.Row = ({ children, className, ...props }) => (
  <tr
    {...props}
    className={twMerge("border-b-2 border-[#eee]", className)}
  >
    {children}
  </tr>
)

Table.Column = ({ children, ...props }) => <td {...props}>{children}</td>
