import jwt from "jsonwebtoken";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import userModel from "../models/user.model.js";

const verifyToken = AsyncHandler(async (req, res, next) => {
  // Get token & Check
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized request!");
  }

  // Verify Token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  // Fetch user
  const user = await userModel
    .findById(decodedToken._id)
    .select("-refreshToken -password");
  if (!user) {
    throw new ApiError(401, "Unauthorized request!");
  }

  // Send req.user
  req.user = user;
  next();
});

export default verifyToken;
