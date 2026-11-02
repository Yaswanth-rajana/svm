import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Calendar, CreditCard, X, Info } from "lucide-react";
import { getPlanPricing } from "../../config/paymentConfig";

export default function PaymentPlanModal({ isOpen, onClose, onConfirm, initialPlan = "FULL" }) {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan, isOpen]);

  // Lock background scroll and notify components (like AnnouncementBar & WhatsAppFloat)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.dispatchEvent(
        new CustomEvent("payment-modal-status", { detail: { isOpen: true, isActive: true } })
      );
    } else {
      document.body.style.overflow = "unset";
      window.dispatchEvent(
        new CustomEvent("payment-modal-status", { detail: { isOpen: false, isActive: false } })
      );
    }
    return () => {
      document.body.style.overflow = "unset";
      window.dispatchEvent(
        new CustomEvent("payment-modal-status", { detail: { isOpen: false, isActive: false } })
      );
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

  const fullPricing = getPlanPricing("FULL");
  const installmentPricing = getPlanPricing("TWO_INSTALLMENTS");

  const handleConfirm = () => {
    onConfirm(selectedPlan);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl"
          >
            {/* Ambient Background Glow Highlights */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            {/* Pinned Header */}
            <div className="p-4 sm:p-5 pb-3 border-b border-slate-800/80 shrink-0 relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Choose a Payment Plan
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select your preferred payment structure to proceed
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/5"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Internally Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Plan Options */}
              <div className="space-y-3">
                {/* Option A: Full Payment */}
                <div
                  role="radio"
                  aria-checked={selectedPlan === "FULL"}
                  tabIndex={0}
                  onClick={() => setSelectedPlan("FULL")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPlan("FULL");
                    }
                  }}
                  className={`relative flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all duration-200 select-none ${
                    selectedPlan === "FULL"
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex h-5 items-center mt-0.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        selectedPlan === "FULL"
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-slate-600 bg-transparent"
                      }`}
                    >
                      {selectedPlan === "FULL" && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-base sm:text-lg text-white">
                        Full Payment
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          Best Value
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          GST excluded
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                      <span className="text-slate-500 line-through text-sm sm:text-base font-medium">
                        ₹{fullPricing.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        ₹{fullPricing.courseFee.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        {fullPricing.discountPercent}% OFF
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      Unlocks all course benefits and certificate immediately.
                    </p>
                  </div>
                </div>

                {/* Option B: 2 Installments */}
                <div
                  role="radio"
                  aria-checked={selectedPlan === "TWO_INSTALLMENTS"}
                  tabIndex={0}
                  onClick={() => setSelectedPlan("TWO_INSTALLMENTS")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPlan("TWO_INSTALLMENTS");
                    }
                  }}
                  className={`relative flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all duration-200 select-none ${
                    selectedPlan === "TWO_INSTALLMENTS"
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex h-5 items-center mt-0.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        selectedPlan === "TWO_INSTALLMENTS"
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-slate-600 bg-transparent"
                      }`}
                    >
                      {selectedPlan === "TWO_INSTALLMENTS" && (
                        <Check className="h-3 w-3 stroke-[3]" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-base sm:text-lg text-white">
                        2 Installments
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                          Flexible
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          GST excluded
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                      <span className="text-slate-500 line-through text-sm sm:text-base font-medium">
                        ₹{installmentPricing.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        ₹{installmentPricing.totalCourseFee.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-400 ml-1">total fee</span>
                      </span>
                      <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        {installmentPricing.discountPercent}% OFF
                      </span>
                    </div>

                    <div className="mt-2 text-xs space-y-1">
                      <p className="font-semibold text-blue-300">
                        1st Installment: ₹{installmentPricing.firstInstallment.courseFee.toLocaleString("en-IN")} + GST = ₹{installmentPricing.firstInstallment.payableAmount.toLocaleString("en-IN")} now
                      </p>
                      <p className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        2nd Installment: ₹{installmentPricing.secondInstallment.courseFee.toLocaleString("en-IN")} + GST = ₹{installmentPricing.secondInstallment.payableAmount.toLocaleString("en-IN")} due within 30 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Summary Breakdown */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 relative text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2.5">
                  <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>
                    Payment Summary Breakdown ({fullPricing.gstRatePercent}% GST Included)
                  </span>
                </div>

                {selectedPlan === "FULL" ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Course Fee</span>
                      <span className="text-slate-200 font-medium">
                        ₹{fullPricing.courseFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GST (18%)</span>
                      <span className="text-slate-200 font-medium">
                        ₹{fullPricing.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                      <span>Total Payable</span>
                      <span className="text-emerald-400 font-extrabold text-base">
                        ₹{fullPricing.totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* First Installment (Payable Now) */}
                    <div className="space-y-1 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                      <div className="flex justify-between text-slate-400">
                        <span>First Installment Course Fee</span>
                        <span className="text-slate-200 font-medium">
                          ₹{installmentPricing.firstInstallment.courseFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>GST (18%)</span>
                        <span className="text-slate-200 font-medium">
                          ₹{installmentPricing.firstInstallment.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="border-t border-blue-500/20 pt-1 flex justify-between font-bold text-sm text-white">
                        <span>Total Payable Now</span>
                        <span className="text-blue-400 font-extrabold">
                          ₹{installmentPricing.firstInstallment.payableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Second Installment (Remaining) */}
                    <div className="space-y-1 px-1 text-slate-400">
                      <div className="flex justify-between">
                        <span>Remaining Course Fee</span>
                        <span className="text-slate-300">
                          ₹{installmentPricing.secondInstallment.courseFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining GST (18%)</span>
                        <span className="text-slate-300">
                          ₹{installmentPricing.secondInstallment.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-300">
                        <span>Remaining Payable</span>
                        <span className="text-amber-400 font-bold">
                          ₹{installmentPricing.secondInstallment.payableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300/90 font-medium pt-0.5">
                        * Second installment of ₹{installmentPricing.secondInstallment.payableAmount.toLocaleString("en-IN")} is due within 30 days.
                      </p>
                    </div>

                    {/* Total Overall */}
                    <div className="border-t border-slate-800 pt-2 space-y-1 px-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Course Fee</span>
                        <span className="text-slate-300">
                          ₹{installmentPricing.totalCourseFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total GST</span>
                        <span className="text-slate-300">
                          ₹{installmentPricing.totalGstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800/80">
                        <span>Total Including GST</span>
                        <span className="text-emerald-400">
                          ₹{installmentPricing.totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Footer with Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 shrink-0 flex flex-col sm:flex-row gap-2.5">
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
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {selectedPlan === "TWO_INSTALLMENTS"
                  ? `Pay ₹${installmentPricing.firstInstallment.payableAmount.toLocaleString("en-IN")} Now`
                  : `Pay ₹${fullPricing.totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Now`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
