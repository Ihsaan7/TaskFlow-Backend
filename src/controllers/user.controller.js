import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import userModel from "../models/user.model.js";
import { genAccessToken, genRefreshToken } from "../utils/Jwt.js";
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
  if (!coverImageFile) {
    throw new ApiError(400, "Cover Image is required!");
  }
  const avatar = await uploadCloudi(avatarFile.path || avatarFile);
  const coverImage = await uploadCloudi(coverImageFile.path || coverImageFile);
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

const loginUser = AsyncHandler(async (req, res) => {
  // Req,body and Check
  // Verify form DB
  // Check password
  // Gen Tokens
  // Send Res with options

  // Get Data and check
  const { email, username, password } = req.body;
  if ((!email && !username) || !password) {
    throw new ApiError(400, "Both fields required!");
  }

  // Check user in DB
  const user = await userModel.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "No user found!");
  }

  // Check password
  const validUser = await user.comparePass(password);
  if (!validUser) {
    throw new ApiError(401, "Invalid credetials!");
  }

  // Generate tokens
  const accessToken = genAccessToken(user._id);
  const refreshToken = genRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Create instance
  const loggedUser = await userModel
    .findById(user._id)
    .select("-refreshToken -password");

  // Options and Return Res
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "User loggedIn successfully"
      )
    );
});

export { registerUser, loginUser };
