import boardModel from "../models/board.model.js";
import listModel from "../models/list.model.js";
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

const archiveBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can archive this board!");
  }

  board.isArchived = true;
  board.archivedAt = new Date();
  await board.save();

  await logActivity(boardID, userId, "board_archived", "board", boardID, board.title);

  return res
    .status(200)
    .json(new ApiResponse(200, board, "Board archived successfully"));
});

const restoreBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can restore this board!");
  }

  board.isArchived = false;
  board.archivedAt = null;
  await board.save();

  await logActivity(boardID, userId, "board_restored", "board", boardID, board.title);

  return res
    .status(200)
    .json(new ApiResponse(200, board, "Board restored successfully"));
});

const getArchivedBoards = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const boards = await boardModel
    .find({ owner: userId, isArchived: true })
    .sort({ archivedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, boards, "Archived boards fetched successfully"));
});

const archiveList = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  const userId = req.user._id;

  const list = await listModel.findById(listID).populate("board");
  if (!list) {
    throw new ApiError(404, "List not found!");
  }

  const board = await boardModel.findById(list.board);
  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the board owner can archive lists!");
  }

  list.isArchived = true;
  list.archivedAt = new Date();
  await list.save();

  await logActivity(list.board._id, userId, "list_archived", "list", listID, list.title);

  return res
    .status(200)
    .json(new ApiResponse(200, list, "List archived successfully"));
});

const restoreList = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  const userId = req.user._id;

  const list = await listModel.findById(listID);
  if (!list) {
    throw new ApiError(404, "List not found!");
  }

  const board = await boardModel.findById(list.board);
  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the board owner can restore lists!");
  }

  list.isArchived = false;
  list.archivedAt = null;
  await list.save();

  await logActivity(list.board, userId, "list_restored", "list", listID, list.title);

  return res
    .status(200)
    .json(new ApiResponse(200, list, "List restored successfully"));
});

const getArchivedLists = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;

  const lists = await listModel
    .find({ board: boardID, isArchived: true })
    .sort({ archivedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, lists, "Archived lists fetched successfully"));
});

const archiveCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const userId = req.user._id;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const board = await boardModel.findById(card.board);
  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the board owner can archive cards!");
  }

  card.isArchived = true;
  card.archivedAt = new Date();
  await card.save();

  await logActivity(card.board, userId, "card_archived", "card", cardID, card.title);

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Card archived successfully"));
});

const restoreCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const userId = req.user._id;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const board = await boardModel.findById(card.board);
  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the board owner can restore cards!");
  }

  card.isArchived = false;
  card.archivedAt = null;
  await card.save();

  await logActivity(card.board, userId, "card_restored", "card", cardID, card.title);

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Card restored successfully"));
});

const getArchivedCards = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;

  const cards = await cardModel
    .find({ board: boardID, isArchived: true })
    .populate("list", "title")
    .sort({ archivedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, cards, "Archived cards fetched successfully"));
});

export {
  archiveBoard,
  restoreBoard,
  getArchivedBoards,
  archiveList,
  restoreList,
  getArchivedLists,
  archiveCard,
  restoreCard,
  getArchivedCards,
};
