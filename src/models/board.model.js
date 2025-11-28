import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title required!"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
  ],
});

const board = mongoose.model("Board", boardSchema);
export default board;
