import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs"
dotenv.config(); // Load environment variables

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload images
export const uploadOnCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "my_app_uploads", // optional: organize files into a folder
      resource_type: "auto", // handles images, videos, pdfs, etc.
    });
    fs.unlinkSync(filePath)
    return result.secure_url; // return uploaded image URL
  } catch (error) {
    fs.unlinkSync(filePath)
    res.status(500).json({ message: `uploadOnCloudinary Error ${error.message}` })
    
    throw error;
  }
};

// Export cloudinary itself in case you need it
export default cloudinary;
