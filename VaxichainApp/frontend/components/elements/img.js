import React from "react"
import Image from "next/image"
import { twMerge } from "tailwind-merge"

export default function Img({ src, alt, className, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={twMerge("object-cover object-center", className)}
      {...props}
    />
  )
}
