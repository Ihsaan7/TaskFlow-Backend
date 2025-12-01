import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  addComment,
  editComment,
  deleteComment,
  getCardComments,
} from "../controllers/comments.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/card/:cardID").get(getCardComments).post(addComment);
router.route("/card/:cardID/:commentID").patch(editComment).delete(deleteComment);

export default router;
