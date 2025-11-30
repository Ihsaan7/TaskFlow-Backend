import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  createCard,
  getAllCard,
  moveCard,
} from "../controllers/card.controller.js";

const router = Router();

router.use(verifyToken);

router.route("/:boardID/:listID/create-card").post(createCard);

router.route("/:listID/all-card").get(getAllCard);

router.route("/:cardID/move-card").patch(moveCard);

export default router;
