import cardModel from "../models/card.model.js";
import boardModel from "../models/board.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const getUpcomingDeadlines = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { days = 7 } = req.query;

  const userBoards = await boardModel.find({
    $or: [
      { owner: userId },
      { "members.user": userId },
    ],
    isArchived: false,
  }).select("_id");

  const boardIds = userBoards.map((b) => b._id);

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days));

  const cards = await cardModel
    .find({
      board: { $in: boardIds },
      dueDate: { $gte: now, $lte: futureDate },
      isArchived: false,
    })
    .populate("board", "title background")
    .populate("list", "title")
    .populate("members", "fullName username avatar")
    .sort({ dueDate: 1 });

  const categorized = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  };

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const endOfTomorrow = new Date(startOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);

  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  cards.forEach((card) => {
    const dueDate = new Date(card.dueDate);
    if (dueDate < startOfToday) {
      categorized.overdue.push(card);
    } else if (dueDate < endOfToday) {
      categorized.today.push(card);
    } else if (dueDate < endOfTomorrow) {
      categorized.tomorrow.push(card);
    } else if (dueDate < endOfWeek) {
      categorized.thisWeek.push(card);
    } else {
      categorized.later.push(card);
    }
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: cards.length,
        categorized,
      },
      "Upcoming deadlines fetched successfully"
    )
  );
});

const getOverdueCards = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userBoards = await boardModel.find({
    $or: [
      { owner: userId },
      { "members.user": userId },
    ],
    isArchived: false,
  }).select("_id");

  const boardIds = userBoards.map((b) => b._id);

  const now = new Date();

  const cards = await cardModel
    .find({
      board: { $in: boardIds },
      dueDate: { $lt: now },
      isArchived: false,
    })
    .populate("board", "title background")
    .populate("list", "title")
    .sort({ dueDate: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, cards, "Overdue cards fetched successfully"));
});

const setDueDate = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { dueDate } = req.body;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  card.dueDate = dueDate ? new Date(dueDate) : null;
  card.reminderSent = false;
  await card.save();

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Due date updated successfully"));
});

const removeDueDate = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  card.dueDate = null;
  card.reminderSent = false;
  await card.save();

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Due date removed successfully"));
});

const getBoardDeadlines = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

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

  const cards = await cardModel
    .find({
      board: boardID,
      dueDate: { $ne: null },
      isArchived: false,
    })
    .populate("list", "title")
    .sort({ dueDate: 1 });

  const now = new Date();
  const categorized = {
    overdue: cards.filter((c) => new Date(c.dueDate) < now),
    upcoming: cards.filter((c) => new Date(c.dueDate) >= now),
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: cards.length,
        categorized,
      },
      "Board deadlines fetched successfully"
    )
  );
});

export {
  getUpcomingDeadlines,
  getOverdueCards,
  setDueDate,
  removeDueDate,
  getBoardDeadlines,
};
