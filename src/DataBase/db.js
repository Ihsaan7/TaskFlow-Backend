import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstant = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `\n Connection Successful MONGODB HOST: ${connectionInstant.connection.host}`
    );
  } catch (err) {
    console.log("Connection error to MONGODB!!!", err);
    process.exit(1);
  }
};

export default connectDB;
