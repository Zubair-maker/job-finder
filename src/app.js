import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js"
import { errorMiddleware } from "./utils/errorHandler.js";

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

app.use("/api/v1/users",userRouter);

app.use(errorMiddleware);

export default app;
