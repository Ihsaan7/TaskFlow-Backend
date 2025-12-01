import boardModel from "../models/board.model.js";
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

const createLabel = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const { name, color } = req.body;
  const userId = req.user._id;

  if (!name || !color) {
    throw new ApiError(400, "Label name and color are required!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can manage labels!");
  }

  const existingLabel = board.labels.find(
    (l) => l.name.toLowerCase() === name.toLowerCase()
  );
  if (existingLabel) {
    throw new ApiError(400, "A label with this name already exists!");
  }

  board.labels.push({ name, color });
  await board.save();

  const newLabel = board.labels[board.labels.length - 1];

  await logActivity(boardID, userId, "label_created", "label", newLabel._id, name, { color });

  return res
    .status(201)
    .json(new ApiResponse(201, newLabel, "Label created successfully"));
});

const updateLabel = AsyncHandler(async (req, res) => {
  const { boardID, labelID } = req.params;
  const { name, color } = req.body;
  const userId = req.user._id;

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can manage labels!");
  }

  const labelIndex = board.labels.findIndex(
    (l) => l._id.toString() === labelID
  );
  if (labelIndex === -1) {
    throw new ApiError(404, "Label not found!");
  }

  const oldName = board.labels[labelIndex].name;

  if (name) board.labels[labelIndex].name = name;
  if (color) board.labels[labelIndex].color = color;
  await board.save();

  if (name && name !== oldName) {
    await cardModel.updateMany(
      { board: boardID, labels: oldName },
      { $set: { "labels.$": name } }
    );
  }

  await logActivity(boardID, userId, "label_updated", "label", labelID, name || oldName, { color });

  return res
    .status(200)
    .json(new ApiResponse(200, board.labels[labelIndex], "Label updated successfully"));
});

const deleteLabel = AsyncHandler(async (req, res) => {
  const { boardID, labelID } = req.params;
  const userId = req.user._id;

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can manage labels!");
  }

  const label = board.labels.find((l) => l._id.toString() === labelID);
  if (!label) {
    throw new ApiError(404, "Label not found!");
  }

  await cardModel.updateMany(
    { board: boardID },
    { $pull: { labels: label.name } }
  );

  board.labels = board.labels.filter((l) => l._id.toString() !== labelID);
  await board.save();

  await logActivity(boardID, userId, "label_deleted", "label", labelID, label.name);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Label deleted successfully"));
});

const getBoardLabels = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;

  const board = await boardModel.findById(boardID).select("labels");
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, board.labels, "Labels fetched successfully"));
});

const addLabelToCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { label } = req.body;
  const userId = req.user._id;

  if (!label) {
    throw new ApiError(400, "Label is required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  if (card.labels.includes(label)) {
    throw new ApiError(400, "Label already added to this card!");
  }

  card.labels.push(label);
  await card.save();

  await logActivity(card.board, userId, "card_updated", "card", cardID, card.title, {
    action: "label_added",
    label,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Label added to card successfully"));
});

const removeLabelFromCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { label } = req.body;
  const userId = req.user._id;

  if (!label) {
    throw new ApiError(400, "Label is required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  card.labels = card.labels.filter((l) => l !== label);
  await card.save();

  await logActivity(card.board, userId, "card_updated", "card", cardID, card.title, {
    action: "label_removed",
    label,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Label removed from card successfully"));
});

export {
  createLabel,
  updateLabel,
  deleteLabel,
  getBoardLabels,
  addLabelToCard,
  removeLabelFromCard,
};
