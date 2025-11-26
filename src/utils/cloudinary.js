import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadCloudi = async (file) => {
  try {
    if (!file) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Handle both file path (local) and buffer (Vercel)
    let response;
    if (typeof file === "string") {
      // File path - local development
      response = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
      });
      fs.unlinkSync(file); // Clean up local file
    } else if (file.buffer) {
      // Buffer from multer memory storage - Vercel
      response = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file.buffer);
      });
    } else {
      throw new Error("Invalid file format");
    }

    console.log(
      "File uploading to Cloudinary Successfull. URL: ",
      response.url
    );

    return response;
  } catch (err) {
    console.log("Uploading on Cloudinary Error!", err);
    // Try to clean up file if it exists
    if (typeof file === "string" && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    return null;
  }
};

const deleteCloudi = async (publicId) => {
  try {
    if (!publicId) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.destroy(publicId);
    // remove on prod
    console.log("File deleted from Cloudinary", response);
    return response;
  } catch (err) {
    console.log("Erorr deleting from Cloudinary: ", err);
    return null;
  }
};

export { uploadCloudi, deleteCloudi };
