import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js";
import jobRouter from "./routes/jobRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import { errorMiddleware } from "./utils/errorHandler.js";
import { sendJobCrone } from "./automation-job/sendJobCron.js";

const app = express();

app.use(
  cors({
    origin: process.env.MONGODB_URI,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

//user routes
app.use("/api/v1/users", userRouter);
//job routes
app.use("/api/v1/job", jobRouter);
//application router
app.use("/api/v1/application", applicationRouter);

sendJobCrone();
app.use(errorMiddleware);

export default app;
