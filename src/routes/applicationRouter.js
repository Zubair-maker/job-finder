import { Router } from "express";
import { isAutorizedUser, verifyToken } from "../middleware/verifyToken.js";
import { Employer, Job_Seeker } from "../constant/constant.js";
import {
  getEmployerAllApplication,
  postJobApplication,
} from "../controller/applicationController.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = Router();

router
  .route("/post/:id")
  .post(
    upload.fields([{ name: "resume", maxCount: 1 }]),
    verifyToken,
    isAutorizedUser(Job_Seeker),
    postJobApplication
  );

router
  .route("/employer/getall")
  .get(verifyToken, isAutorizedUser(Employer), getEmployerAllApplication);

  
export default router;
