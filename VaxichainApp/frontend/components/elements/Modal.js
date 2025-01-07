import React from "react"
import { twMerge } from "tailwind-merge"

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className={twMerge("fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50")}>
      <div className="w-96 rounded-lg bg-white shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
