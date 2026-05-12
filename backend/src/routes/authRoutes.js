import express from "express";
import { zohoCallback } from "../controllers/authController.js";

const router = express.Router();

router.get("/zoho/callback", zohoCallback);

export default router;
