import boardModel from "../models/board.model.js";
import listModel from "../models/list.model.js";
import cardModel from "../models/card.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const globalSearch = AsyncHandler(async (req, res) => {
  const { query, type, boardId } = req.query;
  const userId = req.user._id;

  if (!query || query.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters!");
  }

  const searchRegex = new RegExp(query, "i");
  const results = {
    boards: [],
    lists: [],
    cards: [],
  };

  const userBoards = await boardModel.find({
    $or: [
      { owner: userId },
      { "members.user": userId },
    ],
    isArchived: false,
  }).select("_id");

  const boardIds = userBoards.map((b) => b._id);

  if (!type || type === "boards") {
    results.boards = await boardModel.find({
      _id: { $in: boardIds },
      $or: [
        { title: searchRegex },
        { description: searchRegex },
      ],
      isArchived: false,
    }).select("title description background createdAt");
  }

  if (!type || type === "lists") {
    const listQuery = {
      board: { $in: boardIds },
      title: searchRegex,
      isArchived: false,
    };
    if (boardId) {
      listQuery.board = boardId;
    }
    results.lists = await listModel
      .find(listQuery)
      .populate("board", "title background")
      .select("title position board");
  }

  if (!type || type === "cards") {
    const cardQuery = {
      board: { $in: boardIds },
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { labels: searchRegex },
      ],
      isArchived: false,
    };
    if (boardId) {
      cardQuery.board = boardId;
    }
    results.cards = await cardModel
      .find(cardQuery)
      .populate("board", "title background")
      .populate("list", "title")
      .select("title description labels dueDate board list");
  }

  const totalResults =
    results.boards.length + results.lists.length + results.cards.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        query,
        totalResults,
        results,
      },
      "Search completed successfully"
    )
  );
});

const searchWithinBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const { query } = req.query;
  const userId = req.user._id;

  if (!query || query.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  const hasAccess =
    board.owner.toString() === userId.toString() ||
    board.members.some((m) => m.user.toString() === userId.toString());

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this board!");
  }

  const searchRegex = new RegExp(query, "i");

  const lists = await listModel.find({
    board: boardID,
    title: searchRegex,
    isArchived: false,
  });

  const cards = await cardModel
    .find({
      board: boardID,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { labels: searchRegex },
        { "comments.text": searchRegex },
      ],
      isArchived: false,
    })
    .populate("list", "title");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        query,
        lists,
        cards,
      },
      "Board search completed successfully"
    )
  );
});

export { globalSearch, searchWithinBoard };
