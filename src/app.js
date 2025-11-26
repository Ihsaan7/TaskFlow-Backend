import express from "express";
import AsyncHandler from "./utils/AsyncHandler.js";
import ApiError from "./utils/ApiError.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

//----------- USER ROUTES -------------------
app.use("/api/v1/users", userRouter);

// -----------Test Route ---------------
app.get("/api/health", (req, res) => {
  res.json({ message: "Api is working fine." });
});
app.get(
  "/api/test",
  AsyncHandler(async (req, res) => {
    throw new ApiError(400, "This is a test error!!");
  })
);

// ------------Centeralized Erorr Handlign--------------------
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

export default app;
