import { Inter } from "next/font/google"
import "./globals.css"
import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import ReactQueryProvider from "@/contexts/query-provider/query-provider"
import { Toaster } from "react-hot-toast"
config.autoAddCss = false

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Data Authenticity",
  description: "Maintain authenticity among customers and companies",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#DCDBDB]`}>
        <ReactQueryProvider>
          {children}

          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
