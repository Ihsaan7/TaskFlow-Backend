import List from "../models/list.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const createList = AsyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) {
    throw new ApiError(400, "Title required!");
  }
  const { boardID } = req.params;

  const lastList = await List.findOne({ board: boardID }).sort({
    position: -1,
  });
  const position = lastList ? lastList.position + 1 : 0;

  const list = await List.create({
    title,
    position,
    board: boardID,
    createdBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, list, "List successfully created"));
});

const getAllList = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;

  const lists = await List.find({ board: boardID }).sort({ position: 1 });
  if (!lists || lists.length === 0) {
    throw new ApiError(404, "No list found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, lists, "All lists fetched succesfully"));
});

const reorderList = AsyncHandler(async (req, res) => {
  const { lists } = req.body;

  for (const { id, position } of lists) {
    await List.findByIdAndUpdate(id, { position });
  }

  return res.status(200).json(new ApiResponse(200, {}, "Lists reordered"));
});

export { createList, getAllList, reorderList };
