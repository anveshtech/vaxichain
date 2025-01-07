import Link from "next/link"
import React from "react"

const footerMenu = [
  { name: "License Agreement", url: "#" },
  { name: "Privacy Policy", url: "#" },
  { name: "Security", url: "#" },
  { name: "Terms of Use", url: "#" },
  { name: "Give Feedback", url: "#" },
]

export default function Footer() {
  return (
    <div className="flex items-center justify-between bg-white p-2 text-purple-700">
      <div>
        <ul className="flex justify-center divide-x-2 divide-purple-700">
          {footerMenu.map((each, idx) => (
            <li
              key={idx}
              className="px-6"
            >
              <Link href={each.url}>{each.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mr-2 text-center">
        <p>&copy; 2024 Anvesh Technologies. All Rights Reserved</p>
      </div>
    </div>
  )
}
