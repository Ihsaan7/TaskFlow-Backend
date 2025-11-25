import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./DataBase/db.js";

dotenv.config({
  path: "./.env",
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
