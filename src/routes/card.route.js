import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  createCard,
  getAllCard,
  getCard,
  updateCard,
  moveCard,
  deleteCard,
  commentOnCard,
  archiveCard,
  restoreCard,
  getArchivedCards,
} from "../controllers/card.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/:boardID/:listID/create-card").post(createCard);
router.route("/:boardID/archived-cards").get(getArchivedCards);
router.route("/:listID/all-card").get(getAllCard);
router.route("/:cardID").get(getCard).put(updateCard).delete(deleteCard);
router.route("/:cardID/move-card").patch(moveCard);
router.route("/:cardID/comment").post(commentOnCard);
router.route("/:cardID/archive").patch(archiveCard);
router.route("/:cardID/restore").patch(restoreCard);

export default router;
