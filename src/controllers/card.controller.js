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

const createCard = AsyncHandler(async (req, res) => {
  const { title, description, dueDate, labels, members } = req.body;
  if (!title) {
    throw new ApiError(400, "Title required!");
  }

  const { listID, boardID } = req.params;
  if (!listID) {
    throw new ApiError(400, "Invalid list ID!");
  }
  if (!boardID) {
    throw new ApiError(400, "Invalid board ID!");
  }

  const userId = req.user._id;

  const lastCard = await cardModel
    .findOne({ list: listID, isArchived: false })
    .sort({ position: -1 });
  const position = lastCard ? lastCard.position + 1 : 0;

  const card = await cardModel.create({
    title,
    description,
    dueDate,
    labels,
    members,
    position,
    list: listID,
    board: boardID,
    createdBy: userId,
  });

  await logActivity(boardID, userId, "card_created", "card", card._id, card.title);

  if (dueDate) {
    await logActivity(boardID, userId, "due_date_set", "card", card._id, card.title, {
      dueDate,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, card, "Card created successfully"));
});

const getCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  if (!cardID) {
    throw new ApiError(400, "Invalid card ID!");
  }

  const card = await cardModel
    .findById(cardID)
    .populate("members", "fullName username avatar")
    .populate("comments.user", "fullName username avatar")
    .populate("checklist.completedBy", "fullName username avatar")
    .populate("attachments.uploadedBy", "fullName username avatar")
    .populate("list", "title")
    .populate("board", "title background labels");

  if (!card) {
    throw new ApiError(404, "No card found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Card fetched successfully"));
});

const getAllCard = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  if (!listID) {
    throw new ApiError(400, "Invalid list ID!");
  }

  const cards = await cardModel
    .find({ list: listID, isArchived: false })
    .populate("members", "fullName username avatar")
    .sort({ position: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, cards, "All cards fetched successfully"));
});

const updateCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const userId = req.user._id;

  if (!cardID) {
    throw new ApiError(400, "Invalid card ID!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const updateFields = req.body;
  const oldDueDate = card.dueDate;

  const updatedCard = await cardModel
    .findByIdAndUpdate(cardID, updateFields, { new: true })
    .populate("members", "fullName username avatar");

  await logActivity(card.board, userId, "card_updated", "card", cardID, updatedCard.title, {
    changes: Object.keys(updateFields),
  });

  if (updateFields.dueDate && updateFields.dueDate !== oldDueDate) {
    await logActivity(card.board, userId, "due_date_set", "card", cardID, updatedCard.title, {
      dueDate: updateFields.dueDate,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCard, "Card updated successfully"));
});

const moveCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { newListID, newPosition } = req.body;
  const userId = req.user._id;

  if (!cardID) {
    throw new ApiError(400, "Invalid Card ID!");
  }
  if (!newListID || newPosition === undefined) {
    throw new ApiError(400, "Both newListID and newPosition are required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const oldListID = card.list;

  await cardModel.findByIdAndUpdate(cardID, {
    list: newListID,
    position: newPosition,
  });

  await logActivity(card.board, userId, "card_moved", "card", cardID, card.title, {
    fromList: oldListID,
    toList: newListID,
    newPosition,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Card moved successfully"));
});

const deleteCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const userId = req.user._id;

  if (!cardID) {
    throw new ApiError(400, "Invalid card ID!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  await logActivity(card.board, userId, "card_deleted", "card", cardID, card.title);

  await cardModel.findByIdAndDelete(cardID);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Card deleted successfully"));
});

const commentOnCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  if (!cardID) {
    throw new ApiError(400, "Invalid card ID!");
  }

  const { text } = req.body;
  if (!text) {
    throw new ApiError(400, "Comment is missing!");
  }

  const user = req.user._id;
  if (!user) {
    throw new ApiError(401, "User not authenticated!");
  }

  const comment = { user, text, date: new Date() };

  const card = await cardModel.findByIdAndUpdate(
    cardID,
    {
      $push: { comments: comment },
    },
    { new: true }
  );

  await logActivity(card.board, user, "comment_added", "comment", cardID, text.substring(0, 50), {
    cardTitle: card.title,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Comment added successfully"));
});

const archiveCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const userId = req.user._id;

  if (!cardID) {
    throw new ApiError(400, "Card ID required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const archivedCard = await cardModel.findByIdAndUpdate(
    cardID,
    { isArchived: true, archivedAt: new Date() },
    { new: true }
  );

  await logActivity(card.board, userId, "card_archived", "card", cardID, card.title);

  return res
    .status(200)
    .json(new ApiResponse(200, archivedCard, "Card archived successfully"));
});

const restoreCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const userId = req.user._id;

  if (!cardID) {
    throw new ApiError(400, "Card ID required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const restoredCard = await cardModel.findByIdAndUpdate(
    cardID,
    { isArchived: false, archivedAt: null },
    { new: true }
  );

  await logActivity(card.board, userId, "card_restored", "card", cardID, card.title);

  return res
    .status(200)
    .json(new ApiResponse(200, restoredCard, "Card restored successfully"));
});

const getArchivedCards = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;

  if (!boardID) {
    throw new ApiError(400, "Board ID required!");
  }

  const cards = await cardModel.find({ board: boardID, isArchived: true })
    .populate("list", "title")
    .populate("members", "fullName username avatar")
    .sort({ archivedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, cards, "Archived cards fetched successfully"));
});

export { createCard, getAllCard, moveCard, getCard, updateCard, deleteCard, commentOnCard, archiveCard, restoreCard, getArchivedCards };
