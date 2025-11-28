import { createBoard, getAllBoard } from "../controllers/board.controller.js";
import Router from "express";
import verifyToken from "../middelwares/auth.mware.js";

const router = express.Router();
router.use(verifyToken);

router.route("/boards").post(createBoard);

router.route("/all-boards").get(getAllBoard);
export default router;
