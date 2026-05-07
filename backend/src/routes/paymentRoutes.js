import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payment/create-order", createOrder);
router.post("/payment/verify", verifyPayment);

export default router;
