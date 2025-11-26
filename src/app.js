import express from "express";
import AsyncHandler from "./utils/AsyncHandler.js";
import ApiError from "./utils/ApiError.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Test Route for API working
app.get("/api/health", (req, res) => {
  res.json({ message: "Api is working fine." });
});

// Test route for Utils
app.get(
  "/api/test",
  AsyncHandler(async (req, res) => {
    throw new ApiError(400, "This is a test error!!");
  })
);

// Centeralized Erorr Handlign
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server Erorr";

  res.status(statusCode).json({
    succes: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

export default app;
