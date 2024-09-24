import { User } from "../model/userModel.js";
import uploadCloudinary from "../middleware/uploadCloudanary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import authJwtHandler from "../utils/authTokenHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      role,
      firstSkill,
      secondSkill,
      thirdSkill,
      coverLetter,
    } = req.body;

    if (
      [name, email, password, phone, address, role]?.some(
        (field) => field?.trim() === ""
      )
    ) {
      //   throw new ErrorHandler(400, "All fields are required");
      return next(new ErrorHandler("All fileds are required.", 400));
    }
    if (role === "Job Seeker" && (!firstSkill || !secondSkill || !thirdSkill)) {
      return next(
        new ErrorHandler("Please provide your preferred job skills.", 400)
      );
    }
    const existedUser = await User.findOne({ email });
    console.log("existedUser", existedUser);
    if (existedUser) {
      return next(new ErrorHandler("Email is already registered.", 400));
    }
    const userData = {
      name,
      email,
      phone,
      address,
      password,
      role,
      skills: {
        firstSkill,
        secondSkill,
        thirdSkill,
      },
      coverLetter,
    };
    //multer giving req.files like req.body
    console.log("req.files", req.files);
    if (req.files?.resume && req.files?.resume.length > 0) {
      const resumeLocalPath = req.files?.resume[0].path;
      const resumeUploadResponse = await uploadCloudinary(resumeLocalPath);
      // Add resume URL to userData if the upload was successful
      if (resumeUploadResponse?.url) {
        userData.resume = resumeUploadResponse?.url || "";
      }
    }
    const createdUser = await User.create(userData);
    // Send response
    authJwtHandler(createdUser, 201, res, "User Registered Successfull");
  } catch (error) {
    next(error);
  }
});

export { registerUser };
