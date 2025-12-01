import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import { upload } from "../middelwares/multer.mware.js";
import {
  addAttachment,
  removeAttachment,
  getCardAttachments,
  addAttachmentUrl,
} from "../controllers/attachments.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/card/:cardID").get(getCardAttachments);
router.route("/card/:cardID/upload").post(upload.single("file"), addAttachment);
router.route("/card/:cardID/url").post(addAttachmentUrl);
router.route("/card/:cardID/:attachmentID").delete(removeAttachment);

export default router;
