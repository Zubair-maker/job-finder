import { Router } from "express";
import { upload } from "../middleware/multerMiddleware.js";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserPassword,
  updateUserProfile,
} from "../controller/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();
console.log("router");
router
  .route("/register")
  .post(upload.fields([{ name: "resume", maxCount: 1 }]), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyToken, logoutUser);
router.route("/getuser").get(verifyToken, getUserProfile);
router.route("/update/profile").put(verifyToken, updateUserProfile);
router.route("/update/password").put(verifyToken, updateUserPassword);

export default router;
