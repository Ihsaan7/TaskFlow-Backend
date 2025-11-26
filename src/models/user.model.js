import mongoose from "mongoose";
import bcrpt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, "Username is required!"],
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required!"],
      minlength: 6,
    },
    avatar: {
      type: String,
      required: [true, "Avatar is Required!"],
    },
    coverImage: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hashing pass before saving
userSchema.pre("save", async (next) => {
  if (!this.isModified("password")) return next();

  this.password = await bcrpt.hash(this.password, 10);
  next();
});

// Compairing Hashed password
userSchema.methods.comparePass = async (givenPass) => {
  return await bcrpt.compare(givenPass, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
