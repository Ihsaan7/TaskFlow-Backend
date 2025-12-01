import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Test endpoint working!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Health check passed" });
});

export default app;
