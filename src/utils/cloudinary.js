import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    let response;
    if (typeof file === "string") {
      response = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
      });
      fs.unlinkSync(file);
    } else if (file.buffer) {
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
      "File uploading to Cloudinary Successful. URL: ",
      response.url
    );

    return response;
  } catch (err) {
    console.log("Uploading on Cloudinary Error!", err);
    if (typeof file === "string" && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary", response);
    return response;
  } catch (err) {
    console.log("Error deleting from Cloudinary: ", err);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
export { uploadOnCloudinary as uploadCloudi, deleteFromCloudinary as deleteCloudi };
