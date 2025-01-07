"use client"

import React from "react"
import Link from "next/link"
import Tabs from "../elements/tabs"
import { usePathname } from "next/navigation"
import { useMenuContext } from "./menu-wrapper"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"

export default function SideMenu() {
  const { isMenuExpanded } = useMenuContext()
  const [userData, setUserData] = useState({ companyName: "", userType: "" })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUser()
        if (response.success) {
          setUserData({
            // companyName: response.data.companyName,
            userType: response.data.userType,
          })
        }
      } catch (error) {
        console.error("Error fetching user data", error)
      }
    }
    fetchUserData()
  }, [])

  return (
    <div className="flex h-[100%] flex-col justify-between">
      <Tabs>
        <Tabs.Item
          href="/"
          accessableBy={["super-admin", "dataCollector", "dataVerifier"]}
        >
          <Link
            href="/"
            className={`group flex items-center space-x-4 ${usePathname() === "/" ? "text-white" : ""}`}
            title="dashboard"
          >
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <rect
                className={`transition-all duration-300 ${
                  usePathname() === "/" ? "stroke-white" : "stroke-black group-hover:stroke-white"
                }`}
                x="9.5"
                y="9.1814"
                width="9"
                height="22"
                rx="1"
                stroke="black"
                strokeWidth="2.5"
              />
              <rect
                className={`transition-all duration-300 ${
                  usePathname() === "/" ? "stroke-white" : "stroke-black group-hover:stroke-white"
                }`}
                x="22.5"
                y="9.1814"
                width="9"
                height="11"
                rx="1"
                stroke="black"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect
                className={`transition-all duration-300 ${
                  usePathname() === "/" ? "stroke-white" : "stroke-black group-hover:stroke-white"
                }`}
                x="22.5"
                y="24.1814"
                width="9"
                height="7"
                rx="1"
                stroke="black"
                strokeWidth="2.5"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${usePathname() === "/" ? "text-white" : "text-black group-hover:text-white"}`}
              >
                Dashboard
              </span>
            )}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/dataverifiers"
          accessableBy={["super-admin"]}
        >
          <Link
            href="/dataverifiers"
            className={`group flex items-center space-x-4 ${usePathname() === "/dataverifiers" ? "text-white" : ""}`}
            title="dataverifiers"
          >
            <svg
              className="inline-block w-10"
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/dataverifiers"
                    ? "fill-white stroke-white"
                    : "fill-black group-hover:fill-white group-hover:stroke-white"
                }`}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.9812 26.8852C23.3023 26.984 23.6313 27.0591 23.9652 27.1086C23.4751 28.4759 22.1779 29.4638 20.6457 29.4638H11.5409C9.58823 29.4638 8 27.8752 8 25.9231V14.7949C8 12.8423 9.58823 11.254 11.5409 11.254H14.2661C14.514 9.54347 15.9767 8.21906 17.7554 8.21906H22.6681C24.6202 8.21906 26.2088 9.80729 26.2088 11.7599V14.1719C25.8768 14.1037 25.5389 14.0603 25.1972 14.0455V11.7599C25.1972 10.3659 24.0631 9.23082 22.6681 9.23082H17.7554C16.5343 9.23082 15.5123 10.1008 15.2777 11.2542H20.6466C22.3548 11.2542 23.7833 12.4704 24.1143 14.0807C23.7804 14.1213 23.4514 14.1944 23.1235 14.2863C22.8884 13.1348 21.8669 12.2658 20.6478 12.2658H11.5428C10.1488 12.2658 9.01372 13.401 9.01372 14.7951V25.9232C9.01372 27.3163 10.149 28.4525 11.5428 28.4525H20.6478C21.699 28.4512 22.6019 27.8021 22.9812 26.8852ZM27.9644 25.8994C25.0451 27.5848 21.2998 26.581 19.6149 23.6627C17.9293 20.7453 18.9336 16.9995 21.851 15.3149C24.7693 13.6305 28.5156 14.6327 30.2012 17.5516C31.8866 20.4695 30.8808 24.214 27.9644 25.8994ZM27.4587 25.0241C29.894 23.6192 30.7298 20.4933 29.3239 18.0575C27.919 15.6212 24.7932 14.7834 22.357 16.1897C19.9212 17.5961 19.0848 20.7205 20.4907 23.1566C21.8966 25.5927 25.0223 26.4299 27.4587 25.0241ZM29.4998 25.524L26.8698 27.0416L28.8931 30.5448L31.5232 29.0272L29.4998 25.524ZM31.7957 29.5034L29.1667 31.0209C29.5856 31.7479 30.5143 31.9971 31.2394 31.5762C31.9656 31.1573 32.2166 30.2296 31.7957 29.5034ZM17.7674 14.9192H11.034V15.678H17.7672L17.7674 14.9192ZM16.2188 18.2923H11.034V19.051H16.2188V18.2923ZM11.034 22.4229H16.2188V21.6641H11.034V22.4229ZM11.034 25.7946H17.7672V25.0359H11.034V25.7946ZM23.9217 21.6592L22.3509 19.9188L21.6 20.5981L23.822 23.056L28.1629 19.4407L27.5149 18.6637L23.9217 21.6592Z"
                fill="black"
                stroke="black"
                stroke-width="0.5"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${
                  usePathname() === "/dataverifiers" ? "text-white" : "text-black group-hover:text-white"
                }`}
              >
                Data Verifiers
              </span>
            )}
          </Link>
        </Tabs.Item>
        <Tabs.Item
          href="/datacollectors"
          accessableBy={["super-admin"]}
        >
          <Link
            href="/datacollectors"
            className={`group flex items-center space-x-4 ${usePathname() === "/datacollectors" ? "text-white" : ""}`}
            title="datacollectors"
          >
            <svg
              className="inline-block w-10"
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/datacollectors" ? "stroke-white" : "stroke-black group-hover:stroke-white"
                }`}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 12H16.4492C16.7753 12 16.9385 12 17.0919 12.0368C17.228 12.0695 17.3585 12.1235 17.4779 12.1966C17.6124 12.279 17.7279 12.3945 17.9584 12.625L22.042 16.7087C22.2725 16.9393 22.3872 17.0539 22.4697 17.1885C22.5428 17.3078 22.5976 17.4381 22.6303 17.5743C22.6667 17.7261 22.6667 17.8873 22.6667 18.2069V28M16 12H10.1328C9.38608 12 9.01308 12 8.72787 12.1453C8.47699 12.2732 8.27316 12.477 8.14532 12.7279C8 13.0131 8 13.3867 8 14.1335V29.8668C8 30.6135 8 30.9864 8.14532 31.2716C8.27316 31.5225 8.47699 31.7269 8.72787 31.8548C9.0128 32 9.38536 32 10.1307 32H20.5348C21.28 32 21.654 32 21.9389 31.8548C22.1897 31.7269 22.3931 31.5228 22.5208 31.2719C22.6661 30.9867 22.6667 30.6132 22.6667 29.8665V28M16 12V16.5333C16 17.2801 16 17.6532 16.1453 17.9384C16.2732 18.1893 16.477 18.3936 16.7279 18.5215C17.0128 18.6667 17.3853 18.6667 18.1307 18.6667H22.6661M22.6667 28H29.8693C30.6147 28 30.9881 28 31.2731 27.8548C31.5239 27.7269 31.7264 27.5228 31.8541 27.2719C31.9995 26.9867 32 26.6132 32 25.8665V14.2069C32 13.8874 32 13.7261 31.9636 13.5742C31.9309 13.4382 31.8761 13.3078 31.8031 13.1885C31.7205 13.0539 31.6059 12.9393 31.3753 12.7087L27.2917 8.625C27.0612 8.39456 26.9457 8.27904 26.8112 8.19661C26.6919 8.12351 26.5613 8.06951 26.4252 8.03684C26.2717 8 26.1087 8 25.7825 8H25.3333M17.3333 12.0001V10.1335C17.3333 9.38673 17.3333 9.01308 17.4787 8.72787C17.6065 8.47699 17.8103 8.27316 18.0612 8.14532C18.3464 8 18.7195 8 19.4661 8H25.3333M25.3333 8V12.5333C25.3333 13.2801 25.3333 13.6532 25.4787 13.9384C25.6065 14.1893 25.8103 14.3937 26.0612 14.5215C26.3461 14.6667 26.7187 14.6667 27.464 14.6667H31.9995"
                stroke="black"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${
                  usePathname() === "/datacollectors" ? "text-white" : "text-black group-hover:text-white"
                }`}
              >
                Data Collectors
              </span>
            )}
          </Link>
        </Tabs.Item>
        <Tabs.Item
          href="/orgusers"
          accessableBy={["super-admin", "dataCollector", "dataVerifier"]}
        >
          <Link
            href="/orgusers"
            className={`group flex items-center space-x-4 ${usePathname() === "/orgusers" ? "text-white" : ""}`}
            title="orgusers"
          >
            <svg
              className="inline-block w-10"
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/orgusers" ? "fill-white" : "fill-black group-hover:fill-white"
                }`}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.344 20.2404C20.9269 19.7358 21.3944 19.1118 21.7149 18.4107C22.0353 17.7095 22.2011 16.9476 22.2011 16.1767C22.2011 14.7281 21.6256 13.3388 20.6013 12.3145C19.577 11.2902 18.1877 10.7147 16.7391 10.7147C15.2905 10.7147 13.9013 11.2902 12.8769 12.3145C11.8526 13.3388 11.2772 14.7281 11.2772 16.1767C11.2772 16.9476 11.443 17.7095 11.7634 18.4107C12.0839 19.1118 12.5514 19.7358 13.1342 20.2404C11.605 20.9328 10.3076 22.0511 9.39715 23.4614C8.48666 24.8716 8.00161 26.5143 8 28.193C8 28.4827 8.11509 28.7606 8.31995 28.9654C8.52482 29.1703 8.80267 29.2854 9.09239 29.2854C9.38211 29.2854 9.65997 29.1703 9.86483 28.9654C10.0697 28.7606 10.1848 28.4827 10.1848 28.193C10.1848 26.4547 10.8753 24.7876 12.1045 23.5584C13.3337 22.3292 15.0008 21.6386 16.7391 21.6386C18.4775 21.6386 20.1446 22.3292 21.3738 23.5584C22.6029 24.7876 23.2935 26.4547 23.2935 28.193C23.2935 28.4827 23.4086 28.7606 23.6134 28.9654C23.8183 29.1703 24.0962 29.2854 24.3859 29.2854C24.6756 29.2854 24.9535 29.1703 25.1583 28.9654C25.3632 28.7606 25.4783 28.4827 25.4783 28.193C25.4767 26.5143 24.9916 24.8716 24.0811 23.4614C23.1706 22.0511 21.8732 20.9328 20.344 20.2404ZM16.7391 19.4539C16.091 19.4539 15.4574 19.2617 14.9184 18.9016C14.3795 18.5415 13.9595 18.0296 13.7114 17.4308C13.4634 16.832 13.3985 16.173 13.5249 15.5373C13.6514 14.9016 13.9635 14.3177 14.4218 13.8594C14.8801 13.401 15.4641 13.0889 16.0998 12.9625C16.7355 12.836 17.3944 12.9009 17.9933 13.149C18.5921 13.397 19.1039 13.8171 19.464 14.356C19.8241 14.8949 20.0163 15.5285 20.0163 16.1767C20.0163 17.0458 19.671 17.8794 19.0565 18.494C18.4419 19.1086 17.6083 19.4539 16.7391 19.4539ZM27.379 19.8034C28.0781 19.0162 28.5348 18.0436 28.6941 17.0029C28.8533 15.9622 28.7084 14.8976 28.2767 13.9373C27.8451 12.977 27.145 12.1619 26.2609 11.5902C25.3768 11.0185 24.3463 10.7144 23.2935 10.7147C23.0038 10.7147 22.7259 10.8298 22.5211 11.0347C22.3162 11.2395 22.2011 11.5174 22.2011 11.8071C22.2011 12.0968 22.3162 12.3747 22.5211 12.5796C22.7259 12.7844 23.0038 12.8995 23.2935 12.8995C24.1627 12.8995 24.9962 13.2448 25.6108 13.8594C26.2254 14.474 26.5707 15.3075 26.5707 16.1767C26.5691 16.7505 26.417 17.3138 26.1294 17.8103C25.8419 18.3068 25.429 18.7191 24.9321 19.006C24.7701 19.0994 24.6349 19.2328 24.5392 19.3935C24.4436 19.5542 24.3908 19.7367 24.3859 19.9236C24.3813 20.109 24.424 20.2926 24.5101 20.457C24.5961 20.6213 24.7225 20.7611 24.8775 20.863L25.3035 21.1471L25.4455 21.2235C26.7623 21.8481 27.8731 22.8359 28.6473 24.0707C29.4214 25.3054 29.8266 26.7357 29.8151 28.193C29.8151 28.4827 29.9302 28.7606 30.135 28.9654C30.3399 29.1703 30.6177 29.2854 30.9075 29.2854C31.1972 29.2854 31.475 29.1703 31.6799 28.9654C31.8848 28.7606 31.9999 28.4827 31.9999 28.193C32.0088 26.5166 31.5889 24.8659 30.7802 23.3975C29.9714 21.9291 28.8006 20.6919 27.379 19.8034Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${
                  usePathname() === "/orgusers" ? "text-white" : "text-black group-hover:text-white"
                }`}
              >
                Organization Users
              </span>
            )}
          </Link>
        </Tabs.Item>
        <Tabs.Item
          href="/vaccinationcenters"
          accessableBy={["super-admin", "dataCollector", "dataCollectorUser"]}
        >
          <Link
            href="/vaccinationcenters"
            className={`group flex items-center space-x-4 ${usePathname() === "/vaccinationcenters" ? "text-white" : ""}`}
            title="vaccinationcenters"
          >
            <svg
              className="inline-block w-10"
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/vaccinationcenters" ? "fill-white" : "fill-black group-hover:fill-white"
                }`}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.9 15.3814H24.1C24.4183 15.3814 24.7235 15.255 24.9485 15.0299C25.1736 14.8049 25.3 14.4997 25.3 14.1814C25.3 13.8631 25.1736 13.5579 24.9485 13.3329C24.7235 13.1078 24.4183 12.9814 24.1 12.9814H22.9C22.5817 12.9814 22.2765 13.1078 22.0515 13.3329C21.8264 13.5579 21.7 13.8631 21.7 14.1814C21.7 14.4997 21.8264 14.8049 22.0515 15.0299C22.2765 15.255 22.5817 15.3814 22.9 15.3814ZM22.9 20.1814H24.1C24.4183 20.1814 24.7235 20.055 24.9485 19.8299C25.1736 19.6049 25.3 19.2997 25.3 18.9814C25.3 18.6631 25.1736 18.3579 24.9485 18.1329C24.7235 17.9078 24.4183 17.7814 24.1 17.7814H22.9C22.5817 17.7814 22.2765 17.9078 22.0515 18.1329C21.8264 18.3579 21.7 18.6631 21.7 18.9814C21.7 19.2997 21.8264 19.6049 22.0515 19.8299C22.2765 20.055 22.5817 20.1814 22.9 20.1814ZM16.9 15.3814H18.1C18.4183 15.3814 18.7235 15.255 18.9485 15.0299C19.1736 14.8049 19.3 14.4997 19.3 14.1814C19.3 13.8631 19.1736 13.5579 18.9485 13.3329C18.7235 13.1078 18.4183 12.9814 18.1 12.9814H16.9C16.5817 12.9814 16.2765 13.1078 16.0515 13.3329C15.8264 13.5579 15.7 13.8631 15.7 14.1814C15.7 14.4997 15.8264 14.8049 16.0515 15.0299C16.2765 15.255 16.5817 15.3814 16.9 15.3814ZM16.9 20.1814H18.1C18.4183 20.1814 18.7235 20.055 18.9485 19.8299C19.1736 19.6049 19.3 19.2997 19.3 18.9814C19.3 18.6631 19.1736 18.3579 18.9485 18.1329C18.7235 17.9078 18.4183 17.7814 18.1 17.7814H16.9C16.5817 17.7814 16.2765 17.9078 16.0515 18.1329C15.8264 18.3579 15.7 18.6631 15.7 18.9814C15.7 19.2997 15.8264 19.6049 16.0515 19.8299C16.2765 20.055 16.5817 20.1814 16.9 20.1814ZM31.3 29.7814H30.1V9.3814C30.1 9.06314 29.9736 8.75791 29.7485 8.53287C29.5235 8.30782 29.2183 8.1814 28.9 8.1814H12.1C11.7817 8.1814 11.4765 8.30782 11.2515 8.53287C11.0264 8.75791 10.9 9.06314 10.9 9.3814V29.7814H9.7C9.38174 29.7814 9.07652 29.9078 8.85147 30.1329C8.62643 30.3579 8.5 30.6631 8.5 30.9814C8.5 31.2997 8.62643 31.6049 8.85147 31.8299C9.07652 32.055 9.38174 32.1814 9.7 32.1814H31.3C31.6183 32.1814 31.9235 32.055 32.1485 31.8299C32.3736 31.6049 32.5 31.2997 32.5 30.9814C32.5 30.6631 32.3736 30.3579 32.1485 30.1329C31.9235 29.9078 31.6183 29.7814 31.3 29.7814ZM21.7 29.7814H19.3V24.9814H21.7V29.7814ZM27.7 29.7814H24.1V23.7814C24.1 23.4631 23.9736 23.1579 23.7485 22.9329C23.5235 22.7078 23.2183 22.5814 22.9 22.5814H18.1C17.7817 22.5814 17.4765 22.7078 17.2515 22.9329C17.0264 23.1579 16.9 23.4631 16.9 23.7814V29.7814H13.3V10.5814H27.7V29.7814Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${
                  usePathname() === "/vaccinationcenters" ? "text-white" : "text-black group-hover:text-white"
                }`}
              >
                Vaccination Centers
              </span>
            )}
          </Link>
        </Tabs.Item>
      </Tabs>

      {/* Displaying companyName and userType at the bottom */}
      {isMenuExpanded && (
        <div className="mb-10 mt-auto w-full">
          <div className="w-full rounded bg-yellow-500 p-4 text-center">
            <p className="text-lg text-white"> {userData.companyName}</p>
            <p className="text-sm text-white"> {userData.userType}</p>
          </div>
        </div>
      )}
    </div>
  )
}
