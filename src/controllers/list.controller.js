import List from "../models/list.model.js";
import boardModel from "../models/board.model.js";
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

const createList = AsyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) {
    throw new ApiError(400, "Title required!");
  }
  const { boardID } = req.params;
  const userId = req.user._id;

  const lastList = await List.findOne({ board: boardID, isArchived: false }).sort({
    position: -1,
  });
  const position = lastList ? lastList.position + 1 : 0;

  const list = await List.create({
    title,
    position,
    board: boardID,
    createdBy: userId,
  });

  await boardModel.findByIdAndUpdate(boardID, { $push: { lists: list._id } });

  await logActivity(boardID, userId, "list_created", "list", list._id, list.title);

  return res
    .status(201)
    .json(new ApiResponse(201, list, "List successfully created"));
});

const getAllList = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;

  const lists = await List.find({ board: boardID, isArchived: false }).sort({ position: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, lists, "All lists fetched successfully"));
});

const reorderList = AsyncHandler(async (req, res) => {
  const { lists } = req.body;
  const userId = req.user._id;

  let boardId = null;
  for (const { id, position } of lists) {
    const list = await List.findByIdAndUpdate(id, { position });
    if (list && !boardId) boardId = list.board;
  }

  if (boardId) {
    await logActivity(boardId, userId, "list_reordered", "list", null, null, {
      newOrder: lists,
    });
  }

  return res.status(200).json(new ApiResponse(200, {}, "Lists reordered"));
});

const updateList = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  const { title } = req.body;
  const userId = req.user._id;

  if (!title) {
    throw new ApiError(400, "Title is required!");
  }

  const list = await List.findById(listID);
  if (!list) {
    throw new ApiError(404, "List not found!");
  }

  list.title = title;
  await list.save();

  await logActivity(list.board, userId, "list_updated", "list", listID, title);

  return res
    .status(200)
    .json(new ApiResponse(200, list, "List updated successfully"));
});

const deleteList = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  const userId = req.user._id;

  const list = await List.findById(listID);
  if (!list) {
    throw new ApiError(404, "List not found!");
  }

  const board = await boardModel.findById(list.board);
  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the board owner can delete lists!");
  }

  await logActivity(list.board, userId, "list_deleted", "list", listID, list.title);

  await boardModel.findByIdAndUpdate(list.board, { $pull: { lists: listID } });
  await List.findByIdAndDelete(listID);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "List deleted successfully"));
});

const archiveList = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  const userId = req.user._id;

  if (!listID) {
    throw new ApiError(400, "List ID required!");
  }

  const list = await List.findById(listID);
  if (!list) {
    throw new ApiError(404, "List not found!");
  }

  const archivedList = await List.findByIdAndUpdate(
    listID,
    { isArchived: true, archivedAt: new Date() },
    { new: true }
  );

  await logActivity(list.board, userId, "list_archived", "list", listID, list.title);

  return res
    .status(200)
    .json(new ApiResponse(200, archivedList, "List archived successfully"));
});

const restoreList = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  const userId = req.user._id;

  if (!listID) {
    throw new ApiError(400, "List ID required!");
  }

  const list = await List.findById(listID);
  if (!list) {
    throw new ApiError(404, "List not found!");
  }

  const restoredList = await List.findByIdAndUpdate(
    listID,
    { isArchived: false, archivedAt: null },
    { new: true }
  );

  await logActivity(list.board, userId, "list_restored", "list", listID, list.title);

  return res
    .status(200)
    .json(new ApiResponse(200, restoredList, "List restored successfully"));
});

const getArchivedLists = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;

  if (!boardID) {
    throw new ApiError(400, "Board ID required!");
  }

  const lists = await List.find({ board: boardID, isArchived: true }).sort({ archivedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, lists, "Archived lists fetched successfully"));
});

export { createList, getAllList, reorderList, updateList, deleteList, archiveList, restoreList, getArchivedLists };
