import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
    default: "#61BD4F",
  },
});

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title required!"],
      trim: true,
    },
    background: {
      type: String,
      default: "#0079BF",
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
    archivedAt: {
      type: Date,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member", "viewer"],
          default: "member",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
      },
    ],
    labels: [labelSchema],
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
    },
  },
  { timestamps: true }
);

const board = mongoose.model("Board", boardSchema);
export default board;
