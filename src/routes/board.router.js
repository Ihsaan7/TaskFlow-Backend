import { createBoard, getAllBoard } from "../controllers/board.controller.js";
import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";

const router = Router();
router.use(verifyToken);

router.route("/create-board").post(createBoard);

router.route("/all-boards").get(getAllBoard);
export default router;
