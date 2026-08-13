import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500, // Timeout fast if DB is unreachable
      socketTimeoutMS: 30000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn("⚠️ MongoDB connection unavailable (offline mode active):", error.message);
  }
};

export default connectDB;