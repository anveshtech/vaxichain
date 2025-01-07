// import QrCode from "qrcode"
// import path from "path"
// import { fileURLToPath } from "url"

// export const generateQr = async (text) => {
//   // this is the __dirname equivalent in commonjs module.
//   console.log("generating QR")
//   const __dirname = path.dirname(fileURLToPath(import.meta.url))

//   try {
//     const randomId = crypto.randomUUID()
// console.log("randon id is",randomId)
//     const fileNameAndPath = path.join(__dirname, `../../public/qr-codes/${randomId}.png`)

//     const generatedQr = await QrCode.toFile(fileNameAndPath, text)

//     return fileNameAndPath
//   } catch (error) {
//     throw new Error("error generating qrcode")
//   }
// }

import QrCode from "qrcode"
import path from "path"
import { fileURLToPath } from "url"
import crypto from "crypto" // Import the crypto module
import fs from "fs" // Import fs to ensure the directory exists

export const generateQr = async (text) => {
  // Get __dirname equivalent in ES modules
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  try {
    const randomId = crypto.randomUUID()

    // Define the path to store QR code images
    const dirPath = path.join(__dirname, `../../public/qr-codes/`)
    
    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const fileNameAndPath = path.join(dirPath, `${randomId}.png`)

    // Generate the QR code and save it to a file
    await QrCode.toFile(fileNameAndPath, text)

    return fileNameAndPath
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Error generating QR code")
  }
}

