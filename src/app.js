import express from "express";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/api/health", (req, res) => {
  res.json({ message: "Api is working fine." });
});

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
