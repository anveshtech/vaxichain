import React from "react"

export default function NoPermission() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <span className="text-lg font-bold text-red-800">Apologies</span>
      <span>You don't have permission to view and/or edit this page.</span>
    </div>
  )
}
