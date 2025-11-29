import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  createList,
  getAllList,
  reorderList,
} from "../controllers/list.controller.js";

const router = Router();

router.use(verifyToken);
router.route("/:boardID/create-list").post(createList);

router.route("/:boardID/all-lists").get(getAllList);

router.route("/reorder-list").patch(reorderList);

export default router;
