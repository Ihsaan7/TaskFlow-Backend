import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  inviteMember,
  removeMember,
  updateMemberRole,
  getBoardMembers,
  leaveBoard,
  getSharedBoards,
} from "../controllers/sharing.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/shared-boards").get(getSharedBoards);
router.route("/board/:boardID/members").get(getBoardMembers);
router.route("/board/:boardID/invite").post(inviteMember);
router.route("/board/:boardID/leave").post(leaveBoard);
router.route("/board/:boardID/members/:memberID").patch(updateMemberRole).delete(removeMember);

export default router;
