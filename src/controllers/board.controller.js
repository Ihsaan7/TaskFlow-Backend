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

const createBoard = AsyncHandler(async (req, res) => {
  const { title, description, background } = req.body;
  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required!");
  }

  const board = await boardModel.create({
    title,
    description: description || "",
    background: background || "#0079BF",
    owner: req.user?._id,
  });

  await logActivity(board._id, req.user._id, "board_created", "board", board._id, board.title);

  return res
    .status(201)
    .json(new ApiResponse(201, board, "Board created successfully"));
});

const getAllBoard = AsyncHandler(async (req, res) => {
  const user = req.user?._id;
  if (!user) {
    throw new ApiError(403, "Unauthorized Access or Token expired!");
  }
  
  const ownedBoards = await boardModel
    .find({ owner: user, isArchived: false })
    .sort({ createdAt: -1 });

  const sharedBoards = await boardModel
    .find({ "members.user": user, isArchived: false })
    .populate("owner", "fullName username avatar")
    .sort({ createdAt: -1 });

  const boards = [
    ...ownedBoards.map(b => ({ ...b.toObject(), isShared: false })),
    ...sharedBoards.map(b => ({ ...b.toObject(), isShared: true }))
  ];

  return res
    .status(200)
    .json(new ApiResponse(200, boards, "All Boards fetched successfully"));
});

const getBoardById = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  if (!boardID) {
    throw new ApiError(400, "Board ID required!");
  }

  const board = await boardModel
    .findById(boardID)
    .populate({
      path: "lists",
      match: { isArchived: false },
      options: { sort: { position: 1 } },
    })
    .populate("members.user", "fullName username avatar email")
    .populate("owner", "fullName username avatar email");

  if (!board) {
    throw new ApiError(404, "Invalid Board id!");
  }

  const hasAccess =
    board.owner._id.toString() === userId.toString() ||
    board.members.some((m) => m.user._id.toString() === userId.toString());

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this board!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, board, "Board fetched successfully"));
});

const updateBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const { title, description, background } = req.body;
  const userId = req.user._id;

  if (!boardID) {
    throw new ApiError(400, "Board ID required!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  const isOwner = board.owner.toString() === userId.toString();
  const isAdmin = board.members.some(
    (m) => m.user.toString() === userId.toString() && m.role === "admin"
  );

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Unauthorized to update this board!");
  }

  const updatedBoard = await boardModel.findByIdAndUpdate(
    boardID,
    { title, description, background },
    { new: true }
  );

  await logActivity(boardID, userId, "board_updated", "board", boardID, updatedBoard.title, {
    changes: { title, description, background },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBoard, "Board updated successfully"));
});

const deleteBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  if (!boardID) {
    throw new ApiError(400, "Board ID required!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to delete this board!");
  }

  const lists = await listModel.find({ board: boardID });
  for (const list of lists) {
    await cardModel.deleteMany({ list: list._id });
  }
  await listModel.deleteMany({ board: boardID });
  await Activity.deleteMany({ board: boardID });

  await boardModel.findByIdAndDelete(boardID);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Board deleted successfully"));
});

const archiveBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  if (!boardID) {
    throw new ApiError(400, "Board ID required!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to archive this board!");
  }

  const archivedBoard = await boardModel.findByIdAndUpdate(
    boardID,
    { isArchived: true, archivedAt: new Date() },
    { new: true }
  );

  await logActivity(boardID, userId, "board_archived", "board", boardID, board.title);

  return res
    .status(200)
    .json(new ApiResponse(200, archivedBoard, "Board archived successfully"));
});

const restoreBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  if (!boardID) {
    throw new ApiError(400, "Board ID required!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to restore this board!");
  }

  const restoredBoard = await boardModel.findByIdAndUpdate(
    boardID,
    { isArchived: false, archivedAt: null },
    { new: true }
  );

  await logActivity(boardID, userId, "board_restored", "board", boardID, board.title);

  return res
    .status(200)
    .json(new ApiResponse(200, restoredBoard, "Board restored successfully"));
});

const getArchivedBoards = AsyncHandler(async (req, res) => {
  const user = req.user?._id;
  if (!user) {
    throw new ApiError(403, "Unauthorized Access or Token expired!");
  }
  
  const boards = await boardModel
    .find({ owner: user, isArchived: true })
    .sort({ archivedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, boards, "Archived boards fetched successfully"));
});

export { createBoard, getAllBoard, getBoardById, updateBoard, deleteBoard, archiveBoard, restoreBoard, getArchivedBoards };
