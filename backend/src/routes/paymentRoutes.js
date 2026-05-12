import express from "express";
import { createOrder, verifyPayment, handlePaymentFailure } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payment/create-order", createOrder);
router.post("/payment/verify", verifyPayment);
router.post("/payment/fail", handlePaymentFailure);

export default router;
