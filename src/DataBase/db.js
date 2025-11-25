import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstant = await mongoose.connect(process.env.MOGODB_URI);
    console.log(
      `\n Connection Successfull MONGODB HOST: ${connectionInstant.connection.host}`
    );
  } catch (err) {
    console.log("Connection error to MONGODB!!!", errr);
    process.exit(1);
  }
};

export default connectDB;
