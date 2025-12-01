import {
  createBoard,
  getAllBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  archiveBoard,
  restoreBoard,
  getArchivedBoards,
} from "../controllers/board.controller.js";
import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";

const router = Router();
router.use(verifyToken);

router.route("/create-board").post(createBoard);
router.route("/all-boards").get(getAllBoard);
router.route("/archived").get(getArchivedBoards);
router.route("/:boardID").get(getBoardById);
router.route("/:boardID").put(updateBoard);
router.route("/:boardID").delete(deleteBoard);
router.route("/:boardID/archive").patch(archiveBoard);
router.route("/:boardID/restore").patch(restoreBoard);

export default router;
