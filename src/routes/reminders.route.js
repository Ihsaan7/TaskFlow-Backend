import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  getUpcomingDeadlines,
  getOverdueCards,
  setDueDate,
  removeDueDate,
  getBoardDeadlines,
} from "../controllers/reminders.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/upcoming").get(getUpcomingDeadlines);
router.route("/overdue").get(getOverdueCards);
router.route("/board/:boardID").get(getBoardDeadlines);
router.route("/card/:cardID").put(setDueDate).delete(removeDueDate);

export default router;
