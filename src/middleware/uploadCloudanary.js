import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  console.log("cloud file",localFilePath);
  try {
    if (!localFilePath) return null;
    const resp = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw",
      format: "pdf"
    });
    console.log("response og cloud", resp);
    //file uploading done
    // console.log("file is uploaded succesfully", resp.url);
    fs.unlinkSync(localFilePath);
    return resp;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    if (fs.existsSync(localFilePath)) {
      //remove file only if exist
      fs.unlinkSync(localFilePath); 
    }
    throw error;
  }
};

export default uploadCloudinary;
