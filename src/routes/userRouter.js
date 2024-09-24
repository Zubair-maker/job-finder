import { Router } from "express";
import { upload } from "../middleware/multerMiddleware.js";
import { registerUser } from "../controller/userController.js";

const router = Router();
console.log("router")
router.route("/register").post(upload.fields([{ name: "resume", maxCount: 1 }]), registerUser);

export default router;
