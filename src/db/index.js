import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connecInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(
      `MONGODB connected at ${connecInstance.connection.host} ${connecInstance.connection.name}`
    );
  } catch (error) {
    console.log("MONGODB connection failed !!", error);
  }
};

export default connectDB;