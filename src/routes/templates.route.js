import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  saveAsTemplate,
  createBoardFromTemplate,
  getMyTemplates,
  getPublicTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templates.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/").get(getMyTemplates);
router.route("/public").get(getPublicTemplates);
router.route("/save/:boardID").post(saveAsTemplate);
router.route("/create/:templateID").post(createBoardFromTemplate);
router.route("/:templateID").get(getTemplateById).put(updateTemplate).delete(deleteTemplate);

export default router;
