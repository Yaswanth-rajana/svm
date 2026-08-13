import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Calendar, CreditCard, X } from "lucide-react";
import { PAYMENT_CONFIG } from "../../config/paymentConfig";

export default function PaymentPlanModal({ isOpen, onClose, onConfirm }) {
  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [selectedPlan, setSelectedPlan] = React.useState("FULL");

  const handleConfirm = () => {
    onConfirm(selectedPlan);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-xl md:p-8"
          >
            {/* Glow Highlights */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-200"
              aria-label="Close dialog"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-8 relative">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Choose a Payment Plan
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                Choose how you'd like to pay
              </p>
            </div>

            {/* Plan Options */}
            <div className="space-y-4 mb-8 relative">
              {/* Option 1: Full Payment */}
              <div
                onClick={() => setSelectedPlan("FULL")}
                className={`relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                  selectedPlan === "FULL"
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                    : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                }`}
              >
                <div className="flex h-5 items-center">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                      selectedPlan === "FULL"
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-600 bg-transparent"
                    }`}
                  >
                    {selectedPlan === "FULL" && <Check className="h-3 w-3 text-white font-bold" />}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-lg text-white">Full Payment</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Best Value
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-slate-500 line-through text-base font-medium">₹20,000</span>
                    <span className="text-2xl font-bold text-white">₹{PAYMENT_CONFIG.totalAmount.toLocaleString("en-IN")}</span>
                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">35% OFF</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                    Unlocks all course benefits & certificate immediately
                  </p>
                </div>
              </div>

              {/* Option 2: 2 Installments */}
              <div
                onClick={() => setSelectedPlan("TWO_INSTALLMENTS")}
                className={`relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                  selectedPlan === "TWO_INSTALLMENTS"
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                    : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                }`}
              >
                <div className="flex h-5 items-center">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                      selectedPlan === "TWO_INSTALLMENTS"
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-600 bg-transparent"
                    }`}
                  >
                    {selectedPlan === "TWO_INSTALLMENTS" && <Check className="h-3 w-3 text-white font-bold" />}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-lg text-white">2 Installments</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      Flexible
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-slate-500 line-through text-base font-medium">₹20,000</span>
                    <span className="text-2xl font-bold text-white">
                      ₹{PAYMENT_CONFIG.totalAmount.toLocaleString("en-IN")}<span className="text-sm font-normal text-slate-400"> total</span>
                    </span>
                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">35% OFF</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-450 mt-1">
                    ₹{PAYMENT_CONFIG.firstInstallmentAmount.toLocaleString("en-IN")} now + ₹{PAYMENT_CONFIG.secondInstallmentAmount.toLocaleString("en-IN")} within {PAYMENT_CONFIG.installmentDueDays} days
                  </p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                    Pay the remaining ₹{PAYMENT_CONFIG.secondInstallmentAmount.toLocaleString("en-IN")} within {PAYMENT_CONFIG.installmentDueDays} days
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 relative">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-800 bg-transparent hover:bg-slate-800/40 text-slate-300 font-semibold text-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
              >
                {selectedPlan === "TWO_INSTALLMENTS" ? `Pay ₹${PAYMENT_CONFIG.firstInstallmentAmount.toLocaleString("en-IN")} Now` : "Continue to Payment"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
