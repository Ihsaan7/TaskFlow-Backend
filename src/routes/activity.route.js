import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  getBoardActivity,
  getCardActivity,
  getUserActivity,
} from "../controllers/activity.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/user").get(getUserActivity);
router.route("/board/:boardID").get(getBoardActivity);
router.route("/card/:cardID").get(getCardActivity);

export default router;
