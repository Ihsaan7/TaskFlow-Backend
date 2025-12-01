import dotenv from "dotenv";
import app from "../src/app.js";
import connectDB from "../src/database/db.js";

dotenv.config({
  path: "../.env",
});

// Connect to database
connectDB();

// Export the Express app for Vercel
export default app;
