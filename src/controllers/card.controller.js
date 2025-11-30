import cardModel from "../models/card.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const createCard = AsyncHandler(async (req, res) => {
  const { title, description, dueDate, labels, members } = req.body;
  if (!title) {
    throw new ApiError(400, "Title required!");
  }

  const { listID } = req.params;
  if (!listID) {
    throw new ApiError(400, "Invalid list ID!");
  }

  const { boardID } = req.params;
  if (!boardID) {
    throw new ApiError(400, "Invalid board ID!");
  }

  const lastCard = await cardModel
    .findOne({ list: listID })
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
  });

  return res
    .status(201)
    .json(new ApiResponse(201, card, "Card created successfully"));
});

const getAllCard = AsyncHandler(async (req, res) => {
  const { listID } = req.params;
  if (!listID) {
    throw new ApiError(400, "Invalid list ID!");
  }

  const cards = await cardModel.find({ list: listID }).sort({ position: 1 });
  if (!cards || cards.length === 0) {
    throw new ApiError(404, "No cards found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cards, "All cards fetched successfully"));
});

const moveCard = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { newListID, newPosition } = req.body;
  if (!cardID) {
    throw new ApiError(400, "Invalid Card ID!");
  }
  if (!newListID || !newPosition) {
    throw new ApiError(400, "Both fields required!");
  }

  await cardModel.findByIdAndUpdate(cardID, {
    list: newListID,
    position: newPosition,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Card moved successfully"));
});

export { createCard, getAllCard, moveCard };
