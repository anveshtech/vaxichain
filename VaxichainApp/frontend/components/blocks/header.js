import React from "react"
import ImgWithWrapper from "../composites/img-with-wrapper"
import ProfileIcon from "../composites/profile-icon"

export default function Header() {
  return (
    <div className="flex items-center justify-between bg-white py-2">
      <div className="px-8 py-2">
        {/* <ImgWithWrapper
          wrapperClassName="h-14 aspect-[2]"
          imageClassName="object-contain object-left"
          imageAttributes={{ src: "/assets/logo_satyata_horizontal.png", alt: "satyata_logo_horizontal" }}
        /> */}
      </div>

      <div className="flex items-center gap-6 px-8">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.50002 13.5C7.50002 10.7152 8.60626 8.04451 10.5754 6.07538C12.5445 4.10625 15.2152 3 18 3C20.7848 3 23.4555 4.10625 25.4246 6.07538C27.3938 8.04451 28.5 10.7152 28.5 13.5V19.146L31.233 24.612C31.3588 24.8636 31.4182 25.1431 31.4056 25.4241C31.393 25.7051 31.3087 25.9782 31.1608 26.2175C31.0129 26.4568 30.8063 26.6543 30.5606 26.7912C30.3149 26.9282 30.0383 27 29.757 27H23.811C23.4774 28.2874 22.7257 29.4275 21.6739 30.2414C20.6222 31.0553 19.3299 31.4969 18 31.4969C16.6701 31.4969 15.3779 31.0553 14.3261 30.2414C13.2744 29.4275 12.5227 28.2874 12.189 27H6.24302C5.96173 27 5.68511 26.9282 5.43942 26.7912C5.19373 26.6543 4.98712 26.4568 4.83924 26.2175C4.69135 25.9782 4.60708 25.7051 4.59444 25.4241C4.5818 25.1431 4.64121 24.8636 4.76702 24.612L7.50002 19.146V13.5ZM15.402 27C15.6653 27.456 16.044 27.8347 16.5001 28.098C16.9561 28.3613 17.4734 28.4999 18 28.4999C18.5266 28.4999 19.0439 28.3613 19.5 28.098C19.956 27.8347 20.3347 27.456 20.598 27H15.402ZM18 6C16.0109 6 14.1032 6.79018 12.6967 8.1967C11.2902 9.60322 10.5 11.5109 10.5 13.5V19.146C10.5 19.6115 10.3916 20.0706 10.1835 20.487L8.42852 24H27.573L25.818 20.487C25.6094 20.0707 25.5005 19.6116 25.5 19.146V13.5C25.5 11.5109 24.7098 9.60322 23.3033 8.1967C21.8968 6.79018 19.9891 6 18 6Z"
            fill="black"
          />
        </svg>

        <ProfileIcon />
      </div>
    </div>
  )
}
