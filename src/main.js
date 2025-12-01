import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./database/db.js";

dotenv.config({
  path: "./.env",
});

connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend → http://0.0.0.0:${PORT}`);
});
