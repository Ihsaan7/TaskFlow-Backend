import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import { globalSearch, searchWithinBoard } from "../controllers/search.controller.js";

const router = Router();
router.use(verifyToken);

router.route("/").get(globalSearch);
router.route("/board/:boardID").get(searchWithinBoard);

export default router;
