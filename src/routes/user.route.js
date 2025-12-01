import { Router } from "express";
import verifyToken from "../middelwares/auth.mware.js";
import { uploadMulter } from "../middelwares/multer.mware.js";
import { loginUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

// Register
router.route("/signup").post(
  uploadMulter.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
// Login
router.route("/login").post(loginUser);

// Me ( zustand )
router.get("/me", verifyToken, async (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
