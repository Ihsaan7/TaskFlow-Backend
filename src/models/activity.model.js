import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "board_created",
        "board_updated",
        "board_archived",
        "board_restored",
        "board_deleted",
        "list_created",
        "list_updated",
        "list_archived",
        "list_restored",
        "list_deleted",
        "list_reordered",
        "card_created",
        "card_updated",
        "card_moved",
        "card_archived",
        "card_restored",
        "card_deleted",
        "comment_added",
        "comment_edited",
        "comment_deleted",
        "member_added",
        "member_removed",
        "label_created",
        "label_updated",
        "label_deleted",
        "checklist_item_added",
        "checklist_item_completed",
        "checklist_item_uncompleted",
        "checklist_item_deleted",
        "attachment_added",
        "attachment_deleted",
        "due_date_set",
        "due_date_removed",
      ],
    },
    targetType: {
      type: String,
      enum: ["board", "list", "card", "comment", "label", "member", "checklist", "attachment"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    targetTitle: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

activitySchema.index({ board: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
