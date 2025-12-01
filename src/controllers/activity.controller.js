import Activity from "../models/activity.model.js";
import boardModel from "../models/board.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const getBoardActivity = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const { page = 1, limit = 20 } = req.query;
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

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const activities = await Activity.find({ board: boardID })
    .populate("user", "fullName username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Activity.countDocuments({ board: boardID });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Activity log fetched successfully"
    )
  );
});

const getCardActivity = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const activities = await Activity.find({
    targetId: cardID,
    targetType: "card",
  })
    .populate("user", "fullName username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Activity.countDocuments({
    targetId: cardID,
    targetType: "card",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Card activity fetched successfully"
    )
  );
});

const getUserActivity = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const activities = await Activity.find({ user: userId })
    .populate("board", "title background")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Activity.countDocuments({ user: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "User activity fetched successfully"
    )
  );
});

export { getBoardActivity, getCardActivity, getUserActivity };
