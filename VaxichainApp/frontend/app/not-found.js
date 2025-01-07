import Link from "next/link"
import React from "react"

export default function NotFound() {
  return (
    <div className="py-20">
      <p className="text-center text-red-800">
        <span className="text-3xl font-bold">Sorry!!!</span> <br />
        <span>the page you're trying to access doesn't exist</span>
      </p>

      <p className="text-center">
        Return to{" "}
        <Link
          href="/"
          className="text-blue-800 underline"
        >
          Home
        </Link>
      </p>
    </div>
  )
}
