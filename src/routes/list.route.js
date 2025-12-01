import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import {
  createList,
  getAllList,
  reorderList,
  updateList,
  deleteList,
  archiveList,
  restoreList,
  getArchivedLists,
} from "../controllers/list.controller.js";

const router = Router();

router.use(verifyToken);
router.route("/:boardID/create-list").post(createList);
router.route("/:boardID/all-lists").get(getAllList);
router.route("/:boardID/archived-lists").get(getArchivedLists);
router.route("/reorder-list").patch(reorderList);
router.route("/:listID").put(updateList).delete(deleteList);
router.route("/:listID/archive").patch(archiveList);
router.route("/:listID/restore").patch(restoreList);

export default router;
