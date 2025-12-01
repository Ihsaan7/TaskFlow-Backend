import mongoose from "mongoose";

const templateListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    default: 0,
  },
  cards: [
    {
      title: String,
      description: String,
      position: Number,
      labels: [String],
      checklist: [
        {
          text: String,
          isCompleted: { type: Boolean, default: false },
        },
      ],
    },
  ],
});

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    background: {
      type: String,
      default: "#0079BF",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["personal", "work", "project", "marketing", "sales", "engineering", "other"],
      default: "other",
    },
    lists: [templateListSchema],
    labels: [
      {
        name: String,
        color: String,
      },
    ],
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);
export default Template;
