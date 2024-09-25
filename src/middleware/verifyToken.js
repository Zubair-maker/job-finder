import { User } from "../model/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

//This middleware fuction -> user is authenticated before
// accessing certain protected routes in our application.
export const verifyToken = asyncHandler(async (req, _, next) => {
  const { token } = req.cookies;
  console.log("verifyToken", token);
  //Check if token exists
  if (!token) {
    return next(new ErrorHandler("Unauthorized request.", 401));
  }
  //Verify the token
  const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
  console.log("decodeToken", decodeToken);
  //Find user id stored in the token and exclude sensitive fields like password
  req.user = await User.findById(decodeToken?.id).select("-password");
  console.log("verify user", req.user);

  //Proceed to the next middleware
  next();
});
