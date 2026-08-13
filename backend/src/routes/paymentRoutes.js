import express from "express";
import { createOrder, verifyPayment, handlePaymentFailure, handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payment/create-order", createOrder);
router.post("/payment/verify", verifyPayment);
router.post("/payment/fail", handlePaymentFailure);
router.post("/payment/webhook", handleWebhook);

export default router;
