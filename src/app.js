import express from "express";
import AsyncHandler from "./utils/AsyncHandler.js";
import ApiError from "./utils/ApiError.js";
import userRouter from "./routes/user.route.js";
import boardRouter from "./routes/board.router.js";
import listRouter from "./routes/list.route.js";
import cardRouter from "./routes/card.route.js";
import archiveRouter from "./routes/archive.route.js";
import searchRouter from "./routes/search.route.js";
import activityRouter from "./routes/activity.route.js";
import labelsRouter from "./routes/labels.route.js";
import sharingRouter from "./routes/sharing.route.js";
import attachmentsRouter from "./routes/attachments.route.js";
import checklistRouter from "./routes/checklist.route.js";
import commentsRouter from "./routes/comments.route.js";
import templatesRouter from "./routes/templates.route.js";
import remindersRouter from "./routes/reminders.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: "https://task-flow-frontend-seven.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

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

app.get("/api/health", (req, res) => {
  res.json({ message: "Api is working fine." });
});

app.get(
  "/api/test",
  AsyncHandler(async (req, res) => {
    throw new ApiError(400, "This is a test error!!");
  })
);

app.get("/", (req, res) => {
  res.send("TaskFlow Backend is running.");
});

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
