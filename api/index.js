import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import all routes
import userRouter from "../src/routes/user.route.js";
import boardRouter from "../src/routes/board.router.js";
import listRouter from "../src/routes/list.route.js";
import cardRouter from "../src/routes/card.route.js";
import archiveRouter from "../src/routes/archive.route.js";
import searchRouter from "../src/routes/search.route.js";
import activityRouter from "../src/routes/activity.route.js";
import labelsRouter from "../src/routes/labels.route.js";
import sharingRouter from "../src/routes/sharing.route.js";
import attachmentsRouter from "../src/routes/attachments.route.js";
import checklistRouter from "../src/routes/checklist.route.js";
import commentsRouter from "../src/routes/comments.route.js";
import templatesRouter from "../src/routes/templates.route.js";
import remindersRouter from "../src/routes/reminders.route.js";

const app = express();

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://task-flow-frontend-seven.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

// Database connection cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI not found");
      return null;
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB error:", error.message);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("DB connection failed:", e.message);
  }

  return cached.conn;
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB middleware error:", error);
    next();
  }
});

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/boards", boardRouter);
app.use("/api/v1/lists", listRouter);
app.use("/api/v1/cards", cardRouter);
app.use("/api/v1/archive", archiveRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/activity", activityRouter);
app.use("/api/v1/labels", labelsRouter);
app.use("/api/v1/sharing", sharingRouter);
app.use("/api/v1/attachments", attachmentsRouter);
app.use("/api/v1/checklist", checklistRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/templates", templatesRouter);
app.use("/api/v1/reminders", remindersRouter);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    message: "API is working fine",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow Backend is running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      users: "/api/v1/users",
      boards: "/api/v1/boards"
    }
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

export default app;
