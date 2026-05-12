import express from "express";
import { createOrder, verifyPayment, handlePaymentFailure, verifyPaymentCallback } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payment/create-order", createOrder);
router.post("/payment/verify", verifyPayment);
router.post("/payment/fail", handlePaymentFailure);
router.post("/payment/verify-callback", verifyPaymentCallback);

export default router;
