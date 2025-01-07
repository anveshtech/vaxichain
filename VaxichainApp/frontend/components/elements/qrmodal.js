import React from "react"
import { twMerge } from "tailwind-merge"

export default function QrModal({ show, onClose, children }) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-[#F0F0F0] p-4 rounded-md shadow-lg max-w-[250px] w-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700"
        >
          Close
        </button>
        {children}  
      </div>
    </div>
  )
}
