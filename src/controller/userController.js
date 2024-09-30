import { User } from "../model/userModel.js";
import uploadCloudinary from "../middleware/uploadCloudanary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import authJwtHandler from "../utils/authTokenHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

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
    // console.log("req.files", req.files);
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

const loginUser = asyncHandler(async (req, res, next) => {
  // console.log("Request Body:", req.body);
  const { role, email, password } = req.body;
  // console.log(role, email, password);
  if (!role || !email || !password) {
    return next(
      new ErrorHandler("role, email and password fileds are required.", 400)
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User does not exist.", 400));
  }
  const checkUserPasswordMatch = await user.isPasswordCorrect(password);
  if (!checkUserPasswordMatch) {
    return next(new ErrorHandler("Invalid password.", 400));
  }
  if (user.role !== role) {
    return next(new ErrorHandler("Invalid user role.", 400));
  }
  // Step 6: Send token if everything is valid
  authJwtHandler(user, 200, res, "User logged in successfully.");
});

const logoutUser = asyncHandler(async (_, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json(new ApiResponse(200, {}, "user logout successfully"));
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;
  // console.log("getUserProfile", user);
  if (!user) {
    return next(new ErrorHandler("User does not exist.", 400));
  }
  res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched succcessfully"));
});

const updateUserProfile = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    address,
    coverLetter,
    firstSkill,
    secondSkill,
    thirdSkill,
  } = req.dody;
  //Validate skills for Job Seekers and all fields is required
  if (
    req.user.role === "Job Seeker" &&
    !(firstSkill || !secondSkill || !thirdSkill)
  ) {
    return next(
      new ErrorHandler("Please provide all preferred job skills.", 400)
    );
  }
  const newUserDate = {
    name,
    email,
    phone,
    address,
    coverLetter,
    skills: {
      firstSkill,
      secondSkill,
      thirdSkill,
    },
  };
  //handle resume
  if (req.files.resume && req.files.resume[0].path > 0) {
    const resumeLocalPath = req.files.resume[0].path;

    try {
      const uploadResume = await uploadCloudinary(resumeLocalPath);
      // console.log("updated", uploadResume);
      if (uploadResume) {
        await User.findByIdAndUpdate(
          req.user?._id,
          {
            $set: { resume: { url: uploadResume.url }, ...newUserDate },
          },
          { new: true }
        ).select("-password");

        return res
          .status(200)
          .json(ApiResponse(200, {}, "user updated successfully"));
      }
    } catch (error) {
      return next(
        new ErrorHandler("Error uploading resume. Please try again.", 500)
      );
    }
  }
});

const updateUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  // console.log("passswrd up",confirmPassword,oldPassword,newPassword,"id",id)
  const user = await User.findById(id).select("+password");
  if (!user) {
    return next(new ErrorHandler("user not found", 400));
  }
  //confirm user old password
  const isPasswordMatch = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("old password is incorrect", 400));
  }
  //check new and confirm password are same
  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("New password & confirm password do not match.", 400)
    );
  }
  user.password = newPassword;
  await user.save();
  //generate token for newpassword
  authJwtHandler(user, 200, res, "Password updated successfully.");
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
};
