import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import leadRoutes from "./routes/leadRoutes.js";

dotenv.config();

// connect DB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", leadRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;