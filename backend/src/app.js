import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import leadRoutes from "./routes/leadRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";

dotenv.config();

// connect DB
connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://svm-two.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api", leadRoutes);
app.use("/api", otpRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;