import cardModel from "../models/card.model.js";
import Activity from "../models/activity.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

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

const addAttachment = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const userId = req.user._id;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  if (!req.file) {
    throw new ApiError(400, "No file uploaded!");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
  if (!uploadResult) {
    throw new ApiError(500, "Failed to upload file!");
  }

  const attachment = {
    filename: req.file.originalname,
    url: uploadResult.secure_url,
    type: req.file.mimetype,
    size: req.file.size,
    uploadedBy: userId,
    uploadedAt: new Date(),
  };

  card.attachments.push(attachment);
  await card.save();

  const newAttachment = card.attachments[card.attachments.length - 1];

  await logActivity(
    card.board,
    userId,
    "attachment_added",
    "attachment",
    newAttachment._id,
    req.file.originalname,
    { cardTitle: card.title }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newAttachment, "Attachment added successfully"));
});

const removeAttachment = AsyncHandler(async (req, res) => {
  const { cardID, attachmentID } = req.params;
  const userId = req.user._id;

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const attachmentIndex = card.attachments.findIndex(
    (a) => a._id.toString() === attachmentID
  );
  if (attachmentIndex === -1) {
    throw new ApiError(404, "Attachment not found!");
  }

  const attachment = card.attachments[attachmentIndex];

  const publicId = attachment.url.split("/").pop().split(".")[0];
  await deleteFromCloudinary(publicId);

  card.attachments.splice(attachmentIndex, 1);
  await card.save();

  await logActivity(
    card.board,
    userId,
    "attachment_deleted",
    "attachment",
    attachmentID,
    attachment.filename,
    { cardTitle: card.title }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Attachment removed successfully"));
});

const getCardAttachments = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;

  const card = await cardModel
    .findById(cardID)
    .populate("attachments.uploadedBy", "fullName username avatar");

  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, card.attachments, "Attachments fetched successfully"));
});

const addAttachmentUrl = AsyncHandler(async (req, res) => {
  const { cardID } = req.params;
  const { url, filename } = req.body;
  const userId = req.user._id;

  if (!url) {
    throw new ApiError(400, "URL is required!");
  }

  const card = await cardModel.findById(cardID);
  if (!card) {
    throw new ApiError(404, "Card not found!");
  }

  const attachment = {
    filename: filename || url.split("/").pop() || "Link",
    url,
    type: "link",
    uploadedBy: userId,
    uploadedAt: new Date(),
  };

  card.attachments.push(attachment);
  await card.save();

  const newAttachment = card.attachments[card.attachments.length - 1];

  await logActivity(
    card.board,
    userId,
    "attachment_added",
    "attachment",
    newAttachment._id,
    attachment.filename,
    { cardTitle: card.title, type: "link" }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newAttachment, "Link attachment added successfully"));
});

export { addAttachment, removeAttachment, getCardAttachments, addAttachmentUrl };
