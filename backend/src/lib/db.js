import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected Successfully");
  } catch (error) {
    console.error("Error:", error.message);
  }
};
