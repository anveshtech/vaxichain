import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUIDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadFile = async (filePath) => {
  try {
    if (!filePath) return null

    const response = await cloudinary.uploader.upload(filePath, { resource_type: "auto" })

    fs.unlinkSync(filePath)

    return response
  } catch (error) {
    throw new Error("error uploading file to the server")
  }
}
