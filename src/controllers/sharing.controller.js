import boardModel from "../models/board.model.js";
import User from "../models/user.model.js";
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

const inviteMember = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const { email, username, role = "member" } = req.body;
  const userId = req.user._id;

  if (!email && !username) {
    throw new ApiError(400, "Email or username is required!");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can invite members!");
  }

  const query = email ? { email: email.toLowerCase() } : { username: username.toLowerCase() };
  const userToAdd = await User.findOne(query);
  if (!userToAdd) {
    throw new ApiError(404, "User not found!");
  }

  if (userToAdd._id.toString() === board.owner.toString()) {
    throw new ApiError(400, "Cannot add the owner as a member!");
  }

  const existingMember = board.members.find(
    (m) => m.user.toString() === userToAdd._id.toString()
  );
  if (existingMember) {
    throw new ApiError(400, "User is already a member of this board!");
  }

  board.members.push({
    user: userToAdd._id,
    role,
    addedAt: new Date(),
  });
  await board.save();

  await logActivity(boardID, userId, "member_added", "member", userToAdd._id, userToAdd.fullName, {
    role,
  });

  const populatedBoard = await boardModel
    .findById(boardID)
    .populate("members.user", "fullName email username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedBoard.members, "Member invited successfully"));
});

const removeMember = AsyncHandler(async (req, res) => {
  const { boardID, memberID } = req.params;
  const userId = req.user._id;

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can remove members!");
  }

  const memberIndex = board.members.findIndex(
    (m) => m.user.toString() === memberID
  );
  if (memberIndex === -1) {
    throw new ApiError(404, "Member not found on this board!");
  }

  const removedMember = await User.findById(memberID);
  board.members.splice(memberIndex, 1);
  await board.save();

  await logActivity(boardID, userId, "member_removed", "member", memberID, removedMember?.fullName || "Unknown");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Member removed successfully"));
});

const updateMemberRole = AsyncHandler(async (req, res) => {
  const { boardID, memberID } = req.params;
  const { role } = req.body;
  const userId = req.user._id;

  if (!["admin", "member", "viewer"].includes(role)) {
    throw new ApiError(400, "Invalid role! Must be admin, member, or viewer.");
  }

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the owner can update member roles!");
  }

  const member = board.members.find((m) => m.user.toString() === memberID);
  if (!member) {
    throw new ApiError(404, "Member not found on this board!");
  }

  member.role = role;
  await board.save();

  return res
    .status(200)
    .json(new ApiResponse(200, member, "Member role updated successfully"));
});

const getBoardMembers = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  const board = await boardModel
    .findById(boardID)
    .populate("owner", "fullName email username avatar")
    .populate("members.user", "fullName email username avatar");

  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  const hasAccess =
    board.owner._id.toString() === userId.toString() ||
    board.members.some((m) => m.user._id.toString() === userId.toString());

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this board!");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        owner: board.owner,
        members: board.members,
      },
      "Board members fetched successfully"
    )
  );
});

const leaveBoard = AsyncHandler(async (req, res) => {
  const { boardID } = req.params;
  const userId = req.user._id;

  const board = await boardModel.findById(boardID);
  if (!board) {
    throw new ApiError(404, "Board not found!");
  }

  if (board.owner.toString() === userId.toString()) {
    throw new ApiError(400, "Owner cannot leave the board. Transfer ownership or delete the board instead.");
  }

  const memberIndex = board.members.findIndex(
    (m) => m.user.toString() === userId.toString()
  );
  if (memberIndex === -1) {
    throw new ApiError(400, "You are not a member of this board!");
  }

  board.members.splice(memberIndex, 1);
  await board.save();

  await logActivity(boardID, userId, "member_removed", "member", userId, req.user.fullName, {
    action: "left",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Successfully left the board"));
});

const getSharedBoards = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const boards = await boardModel
    .find({
      "members.user": userId,
      isArchived: false,
    })
    .populate("owner", "fullName username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, boards, "Shared boards fetched successfully"));
});

export {
  inviteMember,
  removeMember,
  updateMemberRole,
  getBoardMembers,
  leaveBoard,
  getSharedBoards,
};
