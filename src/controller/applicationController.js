import { Employer, Job_Seeker } from "../constant/constant.js";
import uploadCloudinary from "../middleware/uploadCloudanary.js";
import { Application } from "../model/applicationModel.js";
import { Job } from "../model/jobModel.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

const postJobApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // jobId
  const { name, email, phone, address, coverLetter } = req.body;

  if (
    [name, email, phone, address, coverLetter]?.some(
      (field) => field?.trim() === ""
    )
  ) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  const jobDetails = await Job.findById(id).select("postedBy title");
  console.log("jobDetails", jobDetails);

  if (!jobDetails) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  // Check if user has already applied for this job
  const isAlreadyApplied = await Application.findOne({
    "jobInfo.jobId": id,
    jobSeekerInfo: req.user._id,
  });
  if (isAlreadyApplied) {
    return next(
      new ErrorHandler("You have already applied for this job.", 400)
    );
  }
  // Construct job seeker info
  const jobSeekerInfo = {
    id: req.user._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    role: "Job Seeker",
  };

  if (req.files?.resume?.[0]?.path) {
    const resumeLocalPath = req.files.resume[0].path;
    console.log("resumeLocalPath", resumeLocalPath);
    try {
      const resumeUploadResponse = await uploadCloudinary(resumeLocalPath);
      console.log("resumeUploadResponse", resumeUploadResponse);
      if (resumeUploadResponse?.url) {
        jobSeekerInfo.resume = resumeUploadResponse.url; // Set resume URL if upload is successful
      } else {
        return next(
          new ErrorHandler("Resume upload failed, no URL returned.", 500)
        );
      }
    } catch (error) {
      return next(
        new ErrorHandler("Error uploading resume to Cloudinary.", 500)
      );
    }
  } else if (req.user?.resume?.url) {
    // Reuse existing resume URL if no new resume is uploaded
    jobSeekerInfo.resume = req.user.resume.url;
  } else if (!req.user?.resume?.url) {
    // Only throw an error if no resume exists at all (new user without resume)
    return next(new ErrorHandler("Please upload your resume.", 400));
  }

  // Construct employer and job info
  const employerInfo = {
    id: jobDetails.postedBy,
    role: "Employer",
  };
  const jobInfo = {
    jobId: id,
    jobTitle: jobDetails.title,
  };

  // Create application
  const application = await Application.create({
    jobSeekerInfo,
    employerInfo,
    jobInfo,
  });
  res
    .status(200)
    .json(new ApiResponse(201, application, "Job Application submitted."));
});

const getEmployerAllApplication = asyncHandler(async (req, res, next) => {
  const applications = await Application.find({
    "employerInfo.id": req.user._id,
    "deletedBy.employer": false,
  });
  if (!applications) {
    return next(new ErrorHandler("applicaion not found.", 404));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, applications, "application fetched successfully.")
    );
});

const jobSeekerGetAllApplication = asyncHandler(async (req, res, next) => {
  const applications = await Application.find({
    "jobSeekerInfo.id": req.user._id,
    "deletedBy.jobSeeker": false,
  });
  if (!applications) {
    return next(new ErrorHandler("applicaion not found.", 404));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, applications, "application fetched successfully.")
    );
});

const deleteApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.user;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found.", 404));
  }

  //deleted based on role
  if (role === Job_Seeker) {
    application.deletedBy.jobSeeker = true;
  } else if (role === Employer) {
    application.deletedBy.employer = true;
  } else {
    return next(new ErrorHandler("Unauthorized role.", 403));
  }

  // Save the updated application status
  await application.save();

  //check both deleted -> yes delete appln from database.
  if (application.deletedBy.jobSeeker && application.deletedBy.employer) {
    await application.deleteOne();
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Application deleted successfully."));
});

export {
  postJobApplication,
  getEmployerAllApplication,
  jobSeekerGetAllApplication,
  deleteApplication,
};
