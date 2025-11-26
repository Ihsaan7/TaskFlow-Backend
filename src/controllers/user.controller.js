import mongoose from "mongoose";
import AsyncHandler from "../utils/AysncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import userModel from "../models/user.model.js";
// import {} from "../utils/Jwt.js";
import { uploadCloudi } from "../utils/cloudinary.js";

const registerUser = AsyncHandler(async (req, res) => {
  // take data
  // validate data
  // check for existing user
  // get files
  // create user
  // create userData -pass
  // send res

  // Get Data and Check
  const { username, fullName, email, password } = req.body;
  if ([username, fullName, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required!");
  }

  // Check for Existing User
  const existingUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists!");
  }

  // Get files and check
  const avatarFile = req.files?.avatar?.[0];
  const coverImageFile = req.files?.coverImage?.[0];
  if (!avatarFile) {
    throw new ApiError(400, "Avatar is required!");
  }
  const avatar = await uploadCloudi(avatarFile.path || avatarFile);
  const coverImage = await uploadCloudi(coverImageFile?.path || coverImage);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!");
  }

  // Create User
  const user = await userModel.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await userModel
    .findById(user._id)
    .select("-refreshToken -password");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user!");
  }

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});
