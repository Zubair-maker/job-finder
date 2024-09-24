import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8082, () => {
      console.log(`Server connected at ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB connection failed !!", error);
  });
