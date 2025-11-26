import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const genAccessToken = (userId) => {
  return jwt.sign(
    {
      _id: userId._id,
      email: userId.email,
      username: userId.username,
      fullName: userId.fullName,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "1d" }
  );
};

const genRefreshToken = (userId) => {
  return jwt.sign(
    {
      _id: userId._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export { genAccessToken, genRefreshToken, verifyToken };
