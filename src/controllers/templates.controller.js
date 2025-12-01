import Template from "../models/template.model.js";
import boardModel from "../models/board.model.js";
import listModel from "../models/list.model.js";
import cardModel from "../models/card.model.js";
import Activity from "../models/activity.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const saveAsTemplate = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const { name, description, isPublic = false, category = "other" } = req.body;
  const userId = req.user._id;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Template name is required!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can save board as template!");
  }

  const lists = await listModel.find({ board: boardID, isArchived: false }).sort({ position: 1 });

  const templateLists = await Promise.all(
    lists.map(async (list) => {
      const cards = await cardModel
        .find({ list: list._id, isArchived: false })
        .sort({ position: 1 });

      return {
        title: list.title,
        position: list.position,
        cards: cards.map((card) => ({
          title: card.title,
          description: card.description,
          position: card.position,
          labels: card.labels,
          checklist: card.checklist.map((item) => ({
            text: item.text,
            isCompleted: false,
          })),
        })),
      };
    })
  );

  const template = await Template.create({
    name: name.trim(),
    description: description?.trim(),
    background: board.background,
    createdBy: userId,
    isPublic,
    category,
    lists: templateLists,
    labels: board.labels,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, template, "Template saved successfully"));
});

const createBoardFromTemplate = AsyncHandler(async (req, res) => {
  const { templateID } = req.params;
  const { title } = req.body;
  const userId = req.user._id;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Board title is required!");
  }

  const template = await Template.findById(templateID);
  if (!template) {
    throw new ApiError(404, "Template not found!");
  }

  if (!template.isPublic && template.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, "This template is private!");
  }

  const board = await boardModel.create({
    title: title.trim(),
    background: template.background,
    owner: userId,
    labels: template.labels,
  });

  for (const templateList of template.lists) {
    const list = await listModel.create({
      board: board._id,
      title: templateList.title,
      position: templateList.position,
      createdBy: userId,
    });

    for (const templateCard of templateList.cards) {
      await cardModel.create({
        list: list._id,
        board: board._id,
        title: templateCard.title,
        description: templateCard.description,
        position: templateCard.position,
        labels: templateCard.labels,
        checklist: templateCard.checklist,
        createdBy: userId,
      });
    }

    board.lists.push(list._id);
  }

  await board.save();

  template.usageCount += 1;
  await template.save();

  await Activity.create({
    board: board._id,
    user: userId,
    action: "board_created",
    targetType: "board",
    targetId: board._id,
    targetTitle: board.title,
    details: { fromTemplate: template.name },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, board, "Board created from template successfully"));
});

const getMyTemplates = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const templates = await Template.find({ createdBy: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, templates, "Templates fetched successfully"));
});

const getPublicTemplates = AsyncHandler(async (req, res) => {
  const { category } = req.query;

  const query = { isPublic: true };
  if (category) {
    query.category = category;
  }

  const templates = await Template.find(query)
    .populate("createdBy", "fullName username avatar")
    .sort({ usageCount: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, templates, "Public templates fetched successfully"));
});

const getTemplateById = AsyncHandler(async (req, res) => {
  const { templateID } = req.params;
  const userId = req.user._id;

  const template = await Template.findById(templateID).populate(
    "createdBy",
    "fullName username avatar"
  );

  if (!template) {
    throw new ApiError(404, "Template not found!");
  }

  if (!template.isPublic && template.createdBy._id.toString() !== userId.toString()) {
    throw new ApiError(403, "This template is private!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template fetched successfully"));
});

const updateTemplate = AsyncHandler(async (req, res) => {
  const { templateID } = req.params;
  const { name, description, isPublic, category } = req.body;
  const userId = req.user._id;

  const template = await Template.findById(templateID);
  if (!template) {
    throw new ApiError(404, "Template not found!");
  }

  if (template.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the creator can update this template!");
  }

  if (name) template.name = name.trim();
  if (description !== undefined) template.description = description?.trim();
  if (isPublic !== undefined) template.isPublic = isPublic;
  if (category) template.category = category;

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template updated successfully"));
});

const deleteTemplate = AsyncHandler(async (req, res) => {
  const { templateID } = req.params;
  const userId = req.user._id;

  const template = await Template.findById(templateID);
  if (!template) {
    throw new ApiError(404, "Template not found!");
  }

  if (template.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the creator can delete this template!");
  }

  await Template.findByIdAndDelete(templateID);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Template deleted successfully"));
});

export {
  saveAsTemplate,
  createBoardFromTemplate,
  getMyTemplates,
  getPublicTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
