import express from "express";
import {
  testBiginConnection,
  getBiginMetadata,
  testCreateRegistration,
  resyncFailedLeads,
  getBiginStats
} from "../controllers/biginController.js";

const router = express.Router();

// GET /api/bigin/test-connection
router.get("/bigin/test-connection", testBiginConnection);

// GET /api/bigin/debug-metadata
router.get("/bigin/debug-metadata", getBiginMetadata);

// GET /api/bigin/stats
router.get("/bigin/stats", getBiginStats);

// POST /api/bigin/test-create-registration
router.post("/bigin/test-create-registration", testCreateRegistration);

// POST /api/bigin/resync-failed
router.post("/bigin/resync-failed", resyncFailedLeads);

export default router;
