import cardModel from "../models/card.model.js";
import Activity from "../models/activity.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const logActivity = async (boardId, userId, action, targetType, targetId, targetTitle, details = {}) => {
  await Activity.create({
    board: boardId,
    user: userId,
    action,
    targetType,
    targetId,
    targetTitle,
    details,
  });
};

const addChecklistItem = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text || text.trim() === "") {
    throw new ApiError(400, "Checklist item text is required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  card.checklist.push({ text: text.trim(), isCompleted: false });
  await card.save();

  const newItem = card.checklist[card.checklist.length - 1];

  await logActivity(
    card.board,
    userId,
    "checklist_item_added",
    "checklist",
    newItem._id,
    text,
    { cardTitle: card.title }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, card.checklist, "Checklist item added successfully"));
});

const updateChecklistItem = AsyncHandler(async (req, res) => {
  const { cardID, itemID } = req.params;
  const { text, isCompleted } = req.body;
  const userId = req.user._id;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const itemIndex = card.checklist.findIndex(
    (item) => item._id.toString() === itemID
  );
  if (itemIndex === -1) {
    throw new ApiError(404, "Checklist item not found!");
  }

  const item = card.checklist[itemIndex];
  const wasCompleted = item.isCompleted;

  if (text !== undefined) {
    item.text = text.trim();
  }

  if (isCompleted !== undefined) {
    item.isCompleted = isCompleted;
    if (isCompleted && !wasCompleted) {
      item.completedAt = new Date();
      item.completedBy = userId;
      await logActivity(
        card.board,
        userId,
        "checklist_item_completed",
        "checklist",
        itemID,
        item.text,
        { cardTitle: card.title }
      );
    } else if (!isCompleted && wasCompleted) {
      item.completedAt = null;
      item.completedBy = null;
      await logActivity(
        card.board,
        userId,
        "checklist_item_uncompleted",
        "checklist",
        itemID,
        item.text,
        { cardTitle: card.title }
      );
    }
  }

  await card.save();

  return res
    .status(200)
    .json(new ApiResponse(200, card.checklist, "Checklist item updated successfully"));
});

const deleteChecklistItem = AsyncHandler(async (req, res) => {
  const { cardID, itemID } = req.params;
  const userId = req.user._id;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const itemIndex = card.checklist.findIndex(
    (item) => item._id.toString() === itemID
  );
  if (itemIndex === -1) {
    throw new ApiError(404, "Checklist item not found!");
  }

  const deletedItem = card.checklist[itemIndex];
  card.checklist.splice(itemIndex, 1);
  await card.save();

  await logActivity(
    card.board,
    userId,
    "checklist_item_deleted",
    "checklist",
    itemID,
    deletedItem.text,
    { cardTitle: card.title }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, card.checklist, "Checklist item deleted successfully"));
});

const getChecklist = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;

  const card = await cardModel
    .findById(cardID)
    .populate("checklist.completedBy", "fullName username avatar");

  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const stats = {
    total: card.checklist.length,
    completed: card.checklist.filter((item) => item.isCompleted).length,
    percentage:
      card.checklist.length > 0
        ? Math.round(
            (card.checklist.filter((item) => item.isCompleted).length /
              card.checklist.length) *
              100
          )
        : 0,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        checklist: card.checklist,
        stats,
      },
      "Checklist fetched successfully"
    )
  );
});

const reorderChecklist = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    throw new ApiError(400, "Items array is required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const reorderedChecklist = items.map((itemId) => {
    return card.checklist.find((item) => item._id.toString() === itemId);
  }).filter(Boolean);

  card.checklist = reorderedChecklist;
  await card.save();

  return res
    .status(200)
    .json(new ApiResponse(200, card.checklist, "Checklist reordered successfully"));
});

export {
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getChecklist,
  reorderChecklist,
};
