import { Router } from "express";
import { isAutorizedUser, verifyToken } from "../middleware/verifyToken.js";
import { Employer } from "../constant/constant.js";
import {
  deletePostedJob,
  getAllJobs,
  getMyPostedJobs,
  getSingleJob,
  postJob,
} from "../controller/jobController.js";

const router = Router();

router.route("/post-job").post(verifyToken, isAutorizedUser(Employer), postJob);
router.route("/getall-jobs").get(getAllJobs);
router.route("/getposted-jobs").get(verifyToken, isAutorizedUser(Employer), getMyPostedJobs);
router.route("/job:id").delete(verifyToken, deletePostedJob);
router.route("/job/:id").get(getSingleJob)

export default router;
