import React from "react"
import { twMerge } from "tailwind-merge"
import Img from "../elements/img"

// className prop here is necessary although not used. Removing it causes issues
export default function ImgWithWrapper({ wrapperClassName, imageClassName, imageAttributes, className }) {
  return (
    <div className={twMerge("relative", wrapperClassName)}>
      <Img
        className={imageClassName}
        {...imageAttributes}
      />
    </div>
  )
}
