import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  createLabel,
  updateLabel,
  deleteLabel,
  getBoardLabels,
  addLabelToCard,
  removeLabelFromCard,
} from "../controllers/labels.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/board/:boardID").get(getBoardLabels).post(createLabel);
router.route("/board/:boardID/:labelID").put(updateLabel).delete(deleteLabel);

router.route("/card/:cardID/add").post(addLabelToCard);
router.route("/card/:cardID/remove").post(removeLabelFromCard);

export default router;
