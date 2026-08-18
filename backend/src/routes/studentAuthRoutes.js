import express from "express";
import { loginWithPassword, setPassword, changePassword, resetPassword } from "../controllers/passwordAuthController.js";
import { requireStudentAuth } from "../middleware/studentAuth.js";

const router = express.Router();

// Public routes
router.post("/login-password", loginWithPassword);
router.post("/reset-password", resetPassword);

// Private routes (requires JWT)
router.post("/set-password", requireStudentAuth, setPassword);
router.post("/change-password", requireStudentAuth, changePassword);

export default router;
