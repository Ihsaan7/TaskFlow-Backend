import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getChecklist,
  reorderChecklist,
} from "../controllers/checklist.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/card/:cardID").get(getChecklist).post(addChecklistItem);
router.route("/card/:cardID/reorder").patch(reorderChecklist);
router.route("/card/:cardID/:itemID").patch(updateChecklistItem).delete(deleteChecklistItem);

export default router;
