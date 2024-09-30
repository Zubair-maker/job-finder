import { Job } from "../model/jobModel.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

const postJob = asyncHandler(async (req, res) => {
  const {
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsiteTitle,
    personalWebsiteUrl,
    jobSkill,
  } = req.body;
  console.log("req.", req.body);
  if (
    [
      title,
      jobType,
      location,
      companyName,
      introduction,
      responsibilities,
      qualifications,
      salary,
      jobSkill,
    ].some((field) => field.trim() === "")
  ) {
    return next(new ErrorHandler("All fileds are required.", 400));
  }
  if (
    (!personalWebsiteTitle && personalWebsiteUrl) ||
    (personalWebsiteTitle && !personalWebsiteUrl)
  ) {
    return next(
      new ErrorHandler(
        "Provide both website url and title, or leave both blank.",
        400
      )
    );
  }
  //Once authenticated, the user's information is attached to the req object.
  const postedBy = req.user._id;
  // console.log("podted", postedBy);
  const job = await Job.create({
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsite: {
      title: personalWebsiteTitle,
      url: personalWebsiteUrl,
    },
    jobSkill,
    postedBy,
  });
  res.status(201).json(new ApiResponse(200, job, "job posted succcessfully"));
});

const getAllJobs = asyncHandler(async (req, res) => {
  const { city, skill, searchKeyword, page = 1, limit = 10 } = req.query;
  console.log("req.query", req.query);
  //build query object dynamically;
  const query = {};
  console.log("query", query);
  if (city) query.location = city;
  if (skill) query.jobSkill = skill;
  if (searchKeyword) {
    const regex = { $regex: searchKeyword, $options: "i" }; //i  Case-insensitive regex
    query.$or = [
      { title: regex },
      { companyName: regex },
      { introduction: regex },
    ];
  }
  //Pagination logic Offset=(Page−1)×Limit
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  //Retrieve jobs with query, limit, and pagination
  const jobs = await Job.find(query).skip(skip).limit(pageSize);
  const totalJobs = await Job.countDocuments(query); // Total jobs matching the query

  res.status(200).json(
    new ApiResponse(200, {
      jobs,
      count: jobs.length,
      totalJobs,
      page: pageNumber,
      totalPages: Math.ceil(totalJobs / pageSize),
    })
  );
});

const getMyPostedJobs = asyncHandler(async (req, res) => {
  //find jobs posted by current user ie Employer.
  const postedJob = await Job.find({ postedBy: req.user?._id });
  if (!postedJob) {
    return next(new ErrorHandler("oops! jobs not found.", 404));
  }

  res
    .status(200)
    .json(new ApiResponse(200, postJob, "fetched all jobssucessfully."));
});

const deletePostedJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleteJob = await Job.findByIdAndDelete(id);

  if (!deleteJob) {
    return next(new ErrorHandler("oops! job not found", 404));
  }

  res.status(200).json(new ApiResponse(200, {}, "Job deleted successfully."));
});

const getSingleJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("oops! job not found", 404));
  }

  res.status(200).json(new ApiResponse(200, job, "job fetch successfully."));
});

export { postJob, getAllJobs, getMyPostedJobs, deletePostedJob, getSingleJob};
