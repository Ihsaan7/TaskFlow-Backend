import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
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
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI not found");
      return null;
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    })
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB error:", error.message);
        cached.promise = null;
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

// Connect DB middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (error) {
    console.error("DB middleware error:", error);
  }
  next();
});

// Import routes dynamically with error handling
async function loadRoutes() {
  try {
    const userRouter = (await import("../src/routes/user.route.js")).default;
    app.use("/api/v1/users", userRouter);
    console.log("✓ User routes loaded");
  } catch (e) {
    console.error("✗ User routes failed:", e.message);
  }

  try {
    const boardRouter = (await import("../src/routes/board.router.js")).default;
    app.use("/api/v1/boards", boardRouter);
    console.log("✓ Board routes loaded");
  } catch (e) {
    console.error("✗ Board routes failed:", e.message);
  }

  try {
    const listRouter = (await import("../src/routes/list.route.js")).default;
    app.use("/api/v1/lists", listRouter);
    console.log("✓ List routes loaded");
  } catch (e) {
    console.error("✗ List routes failed:", e.message);
  }

  try {
    const cardRouter = (await import("../src/routes/card.route.js")).default;
    app.use("/api/v1/cards", cardRouter);
    console.log("✓ Card routes loaded");
  } catch (e) {
    console.error("✗ Card routes failed:", e.message);
  }

  try {
    const archiveRouter = (await import("../src/routes/archive.route.js")).default;
    app.use("/api/v1/archive", archiveRouter);
    console.log("✓ Archive routes loaded");
  } catch (e) {
    console.error("✗ Archive routes failed:", e.message);
  }

  try {
    const searchRouter = (await import("../src/routes/search.route.js")).default;
    app.use("/api/v1/search", searchRouter);
    console.log("✓ Search routes loaded");
  } catch (e) {
    console.error("✗ Search routes failed:", e.message);
  }

  try {
    const activityRouter = (await import("../src/routes/activity.route.js")).default;
    app.use("/api/v1/activity", activityRouter);
    console.log("✓ Activity routes loaded");
  } catch (e) {
    console.error("✗ Activity routes failed:", e.message);
  }

  try {
    const labelsRouter = (await import("../src/routes/labels.route.js")).default;
    app.use("/api/v1/labels", labelsRouter);
    console.log("✓ Labels routes loaded");
  } catch (e) {
    console.error("✗ Labels routes failed:", e.message);
  }

  try {
    const sharingRouter = (await import("../src/routes/sharing.route.js")).default;
    app.use("/api/v1/sharing", sharingRouter);
    console.log("✓ Sharing routes loaded");
  } catch (e) {
    console.error("✗ Sharing routes failed:", e.message);
  }

  try {
    const attachmentsRouter = (await import("../src/routes/attachments.route.js")).default;
    app.use("/api/v1/attachments", attachmentsRouter);
    console.log("✓ Attachments routes loaded");
  } catch (e) {
    console.error("✗ Attachments routes failed:", e.message);
  }

  try {
    const checklistRouter = (await import("../src/routes/checklist.route.js")).default;
    app.use("/api/v1/checklist", checklistRouter);
    console.log("✓ Checklist routes loaded");
  } catch (e) {
    console.error("✗ Checklist routes failed:", e.message);
  }

  try {
    const commentsRouter = (await import("../src/routes/comments.route.js")).default;
    app.use("/api/v1/comments", commentsRouter);
    console.log("✓ Comments routes loaded");
  } catch (e) {
    console.error("✗ Comments routes failed:", e.message);
  }

  try {
    const templatesRouter = (await import("../src/routes/templates.route.js")).default;
    app.use("/api/v1/templates", templatesRouter);
    console.log("✓ Templates routes loaded");
  } catch (e) {
    console.error("✗ Templates routes failed:", e.message);
  }

  try {
    const remindersRouter = (await import("../src/routes/reminders.route.js")).default;
    app.use("/api/v1/reminders", remindersRouter);
    console.log("✓ Reminders routes loaded");
  } catch (e) {
    console.error("✗ Reminders routes failed:", e.message);
  }
}

// Load routes
await loadRoutes();

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API is working fine",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow Backend is running on Vercel",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      health: "/api/health",
      users: "/api/v1/users",
      boards: "/api/v1/boards",
      lists: "/api/v1/lists",
      cards: "/api/v1/cards",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error.message);
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

export default app;
