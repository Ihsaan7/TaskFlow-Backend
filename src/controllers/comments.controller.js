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

const addComment = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text || text.trim() === "") {
    throw new ApiError(400, "Comment text is required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const comment = {
    user: userId,
    text: text.trim(),
    date: new Date(),
  };

  card.comments.push(comment);
  await card.save();

  const newComment = card.comments[card.comments.length - 1];

  await logActivity(
    card.board,
    userId,
    "comment_added",
    "comment",
    newComment._id,
    text.substring(0, 50),
    { cardTitle: card.title, cardId: cardID }
  );

  const updatedCard = await cardModel
    .findById(cardID)
    .populate("comments.user", "fullName username avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, updatedCard.comments, "Comment added successfully"));
});

const editComment = AsyncHandler(async (req, res) => {
  const { cardID, commentID } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text || text.trim() === "") {
    throw new ApiError(400, "Comment text is required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const commentIndex = card.comments.findIndex(
    (c) => c._id.toString() === commentID
  );
  if (commentIndex === -1) {
    throw new ApiError(404, "Comment not found!");
  }

  const comment = card.comments[commentIndex];

  if (comment.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only edit your own comments!");
  }

  comment.text = text.trim();
  comment.editedAt = new Date();
  await card.save();

  await logActivity(
    card.board,
    userId,
    "comment_edited",
    "comment",
    commentID,
    text.substring(0, 50),
    { cardTitle: card.title, cardId: cardID }
  );

  const updatedCard = await cardModel
    .findById(cardID)
    .populate("comments.user", "fullName username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCard.comments, "Comment updated successfully"));
});

const deleteComment = AsyncHandler(async (req, res) => {
  const { cardID, commentID } = req.params;
  const userId = req.user._id;

  const card = await cardModel.findById(cardID).populate("board");
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const commentIndex = card.comments.findIndex(
    (c) => c._id.toString() === commentID
  );
  if (commentIndex === -1) {
    throw new ApiError(404, "Comment not found!");
  }

  const comment = card.comments[commentIndex];
  const isOwner = comment.user.toString() === userId.toString();
  const isBoardOwner = card.board.owner?.toString() === userId.toString();

  if (!isOwner && !isBoardOwner) {
    throw new ApiError(403, "You don't have permission to delete this comment!");
  }

  const deletedCommentText = comment.text;
  card.comments.splice(commentIndex, 1);
  await card.save();

  await logActivity(
    card.board._id || card.board,
    userId,
    "comment_deleted",
    "comment",
    commentID,
    deletedCommentText.substring(0, 50),
    { cardTitle: card.title, cardId: cardID }
  );

  const updatedCard = await cardModel
    .findById(cardID)
    .populate("comments.user", "fullName username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCard.comments, "Comment deleted successfully"));
});

const getCardComments = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;

  const card = await cardModel
    .findById(cardID)
    .populate("comments.user", "fullName username avatar");

  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const sortedComments = card.comments.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return res
    .status(200)
    .json(new ApiResponse(200, sortedComments, "Comments fetched successfully"));
});

export { addComment, editComment, deleteComment, getCardComments };
