import express from "express";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/api/health", (req, res) => {
  res.json({ message: "Api is working fine." });
});

export default app;
