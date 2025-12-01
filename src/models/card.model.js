import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  size: {
    type: Number,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const cardSchema = new mongoose.Schema(
  {
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    position: {
      type: Number,
      default: 0,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        date: { type: Date, default: Date.now },
        editedAt: { type: Date },
      },
    ],
    labels: [
      {
        type: String,
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
    },
    checklist: [checklistItemSchema],
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);
export default Card;
