import express from "express";
import { createLead, requestCall } from "../controllers/leadController.js";

const router = express.Router();

// POST /api/leads
router.post("/leads", createLead);

// POST /api/request-call
router.post("/request-call", requestCall);

export default router;
