import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  archiveBoard,
  restoreBoard,
  getArchivedBoards,
  archiveList,
  restoreList,
  getArchivedLists,
  archiveCard,
  restoreCard,
  getArchivedCards,
} from "../controllers/archive.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/boards").get(getArchivedBoards);
router.route("/boards/:boardID/archive").patch(archiveBoard);
router.route("/boards/:boardID/restore").patch(restoreBoard);

router.route("/boards/:boardID/lists").get(getArchivedLists);
router.route("/lists/:listID/archive").patch(archiveList);
router.route("/lists/:listID/restore").patch(restoreList);

router.route("/boards/:boardID/cards").get(getArchivedCards);
router.route("/cards/:cardID/archive").patch(archiveCard);
router.route("/cards/:cardID/restore").patch(restoreCard);

export default router;
