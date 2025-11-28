import boardModel from "../models/board.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const createBoard = AsyncHandler(async (req, res) => {
  const { title, description, background } = req.body;
  if ([title, description, background].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields required!");
  }

  const board = await boardModel.create({
    title,
    description,
    background: background || "#0079BF",
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, board, "Board created successfully"));
});

const getAllBoard = AsyncHandler(async (req, res) => {
  const user = req.user?._id;
  if (!user) {
    throw new ApiError(403, "Unauthorized Access or Token expired!");
  }
  const boards = await boardModel.find({ owner: user }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, boards, "All Boards fetched successfully"));
});

export { createBoard, getAllBoard };
