import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Printer,
  Calendar,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowLeft,
  FileText
} from "lucide-react";
import { getApiUrl } from "../config/apiConfig";
import { handleRazorpayPayment } from "../utils/payment";
import { PAYMENT_CONFIG } from "../config/paymentConfig";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState(null);
  const [payingSecondInstallment, setPayingSecondInstallment] = useState(false);

  const API_URL = getApiUrl();

  const leadId = searchParams.get("leadId");
  const paymentId = searchParams.get("paymentId") || searchParams.get("razorpay_payment_id");
  const orderId = searchParams.get("orderId");
  const paymentLinkId = searchParams.get("razorpay_payment_link_id");

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetLeadId = leadId;
      let targetPaymentId = paymentId;
      let targetPaymentLinkId = paymentLinkId;
      let targetOrderId = orderId;

      // Fallback to session storage if query params are not present
      if (!targetLeadId && !targetPaymentId && !targetPaymentLinkId && !targetOrderId) {
        try {
          const cached = sessionStorage.getItem("smven_last_payment");
          if (cached) {
            const parsed = JSON.parse(cached);
            targetLeadId = parsed.leadId;
            targetPaymentId = parsed.paymentId;
            targetOrderId = parsed.orderId;
          }
        } catch (e) {}
      }

      const params = new URLSearchParams();
      if (targetLeadId) params.append("leadId", targetLeadId);
      if (targetPaymentId) params.append("paymentId", targetPaymentId);
      if (targetPaymentLinkId) params.append("paymentLinkId", targetPaymentLinkId);
      if (targetOrderId) params.append("orderId", targetOrderId);

      if (!params.toString()) {
        // No identifiers available, show generic success view
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/payment/receipt?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.data) {
        setReceiptData(data.data);
      } else {
        setError(data.message || "Could not retrieve detailed payment invoice.");
      }
    } catch (err) {
      console.error("Error fetching receipt:", err);
      setError("Failed to load payment invoice from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [leadId, paymentId, paymentLinkId, orderId]);

  const handlePaySecondInstallment = () => {
    if (!receiptData?.lead) return;

    setPayingSecondInstallment(true);
    handleRazorpayPayment({
      leadData: receiptData.lead,
      formData: receiptData.lead,
      amount: receiptData.billing?.secondInstallment?.amount || 4720,
      installmentNumber: 2,
      onSuccess: () => {
        setPayingSecondInstallment(false);
        // Refresh receipt to reflect paid in full status
        fetchReceipt();
      },
      onFailure: () => {
        setPayingSecondInstallment(false);
      },
      onModalClose: () => {
        setPayingSecondInstallment(false);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const isPartiallyPaid =
    receiptData?.billing?.paymentStatus === "PARTIALLY_PAID" ||
    (receiptData?.billing?.paymentPlan === "TWO_INSTALLMENTS" &&
      receiptData?.billing?.balanceAmount > 0);

  const formattedDueDate = receiptData?.billing?.secondInstallmentDueDate
    ? new Date(receiptData.billing.secondInstallmentDueDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : null;

  const formattedPaymentDate = receiptData?.billing?.paymentDate
    ? new Date(receiptData.billing.paymentDate).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : new Date().toLocaleDateString("en-IN");

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white py-10 px-4 sm:px-6 lg:px-8">
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-sm font-semibold transition-all shadow-sm"
            >
              <Printer className="h-4 w-4" />
              Print / Save Receipt
            </button>
          </div>
        </div>

        {/* Top Status Banner */}
        <div className="bg-[#11161d] border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.35)]">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {isPartiallyPaid
              ? "First Installment Confirmed! 🎓"
              : "Registration & Payment Successful! 🎓"}
          </h1>

          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            {isPartiallyPaid
              ? "Your seat is reserved. First installment has been verified and recorded."
              : "Your course enrollment is complete and your fee is fully paid. All course materials and certificate access are unlocked."}
          </p>

          {/* Installment Status Notice */}
          {isPartiallyPaid && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-300">
                    Remaining Balance: ₹{Number(receiptData?.billing?.balanceAmount || 4720).toFixed(2)}
                  </p>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Due within 30 days{formattedDueDate ? ` (on or before ${formattedDueDate})` : ""}.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePaySecondInstallment}
                disabled={payingSecondInstallment}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0"
              >
                {payingSecondInstallment
                  ? "Processing..."
                  : `Pay 2nd Installment (₹${Number(receiptData?.billing?.secondInstallment?.amount || 4720).toFixed(2)})`}
              </button>
            </div>
          )}
        </div>

        {/* Detailed Tax Invoice / Payment Receipt Card */}
        {receiptData ? (
          <div className="bg-[#11161d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-white/10 print:border-gray-300">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm">
                    SMV
                  </div>
                  <h2 className="text-lg font-bold text-white print:text-black">
                    {receiptData.business?.name || "Smart Mate Ventures"}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 print:text-gray-600">
                  {receiptData.business?.email || "notify@smven.com"}
                </p>
                <p className="text-xs text-slate-400 print:text-gray-600">
                  {receiptData.business?.website || "https://smven.com"}
                </p>
                {receiptData.business?.gstin ? (
                  <p className="text-xs font-semibold text-slate-300 print:text-gray-800 mt-1">
                    GSTIN: {receiptData.business.gstin}
                  </p>
                ) : null}
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2 print:border-gray-400 print:text-black">
                  Tax Invoice / Receipt
                </span>
                <p className="text-xs text-slate-400 print:text-gray-600">
                  Date: <span className="text-slate-200 print:text-black font-medium">{formattedPaymentDate}</span>
                </p>
                <p className="text-xs text-slate-400 print:text-gray-600">
                  Plan:{" "}
                  <span className="text-slate-200 print:text-black font-semibold">
                    {receiptData.billing?.paymentPlan === "TWO_INSTALLMENTS" ? "2 Installments" : "Full Payment"}
                  </span>
                </p>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="py-6 border-b border-white/10 print:border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-white print:text-black text-sm">
                  {receiptData.lead?.name}
                </p>
                <p className="text-slate-400 print:text-gray-700">{receiptData.lead?.email}</p>
                <p className="text-slate-400 print:text-gray-700">{receiptData.lead?.phone}</p>
              </div>

              <div className="sm:text-right">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-1">
                  Program Details
                </span>
                <p className="font-bold text-white print:text-black text-sm">
                  {receiptData.lead?.programTitle || receiptData.lead?.program}
                </p>
                <p className="text-slate-400 print:text-gray-700 text-xs">
                  Status:{" "}
                  <span
                    className={`font-bold ${
                      isPartiallyPaid ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {isPartiallyPaid ? "Partially Paid" : "Paid in Full"}
                  </span>
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6 border-b border-white/10 print:border-gray-300">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 print:text-gray-600 border-b border-slate-800 print:border-gray-300 text-left">
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 text-right font-semibold">Course Fee (excl. GST)</th>
                    <th className="pb-3 text-right font-semibold">GST ({receiptData.billing?.gstRatePercent || 18}%)</th>
                    <th className="pb-3 text-right font-semibold">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                  {receiptData.billing?.paymentPlan === "TWO_INSTALLMENTS" ? (
                    <>
                      {/* First Installment Row */}
                      <tr>
                        <td className="py-3">
                          <p className="font-semibold text-white print:text-black">
                            First Installment - {receiptData.lead?.programTitle}
                          </p>
                          <span className="text-[11px] text-emerald-400 font-medium">Paid</span>
                        </td>
                        <td className="py-3 text-right text-slate-300 print:text-black">
                          ₹{Number(receiptData.billing?.firstInstallment?.courseFee || 7000).toFixed(2)}
                        </td>
                        <td className="py-3 text-right text-slate-300 print:text-black">
                          ₹{Number(receiptData.billing?.firstInstallment?.gstAmount || 1260).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-bold text-white print:text-black">
                          ₹{Number(receiptData.billing?.firstInstallment?.amount || 8260).toFixed(2)}
                        </td>
                      </tr>

                      {/* Second Installment Row */}
                      <tr>
                        <td className="py-3">
                          <p className="font-semibold text-white print:text-black">
                            Second Installment - {receiptData.lead?.programTitle}
                          </p>
                          <span
                            className={`text-[11px] font-medium ${
                              isPartiallyPaid ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {isPartiallyPaid
                              ? `Due within 30 days${formattedDueDate ? ` (${formattedDueDate})` : ""}`
                              : "Paid"}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-300 print:text-black">
                          ₹{Number(receiptData.billing?.secondInstallment?.courseFee || 4000).toFixed(2)}
                        </td>
                        <td className="py-3 text-right text-slate-300 print:text-black">
                          ₹{Number(receiptData.billing?.secondInstallment?.gstAmount || 720).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-bold text-white print:text-black">
                          ₹{Number(receiptData.billing?.secondInstallment?.amount || 4720).toFixed(2)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="py-3">
                        <p className="font-semibold text-white print:text-black">
                          {receiptData.lead?.programTitle} (Full Payment)
                        </p>
                        <span className="text-[11px] text-emerald-400 font-medium">Paid in Full</span>
                      </td>
                      <td className="py-3 text-right text-slate-300 print:text-black">
                        ₹{Number(receiptData.billing?.courseFee || 9999).toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-slate-300 print:text-black">
                        ₹{Number(receiptData.billing?.gstAmount || 1799.82).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-bold text-white print:text-black">
                        ₹{Number(receiptData.billing?.totalAmount || 11798.82).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="py-6 border-b border-white/10 print:border-gray-300 flex justify-end text-xs">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-slate-400 print:text-gray-600">
                  <span>Course Fee (excl. GST):</span>
                  <span className="text-slate-200 print:text-black font-medium">
                    ₹{Number(receiptData.billing?.courseFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-gray-600">
                  <span>GST ({receiptData.billing?.gstRatePercent || 18}%):</span>
                  <span className="text-slate-200 print:text-black font-medium">
                    ₹{Number(receiptData.billing?.gstAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-gray-600 font-bold border-t border-slate-800 print:border-gray-300 pt-2 text-sm text-white print:text-black">
                  <span>Total Course Payable:</span>
                  <span>₹{Number(receiptData.billing?.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 print:text-green-800 font-semibold pt-1">
                  <span>Amount Paid:</span>
                  <span>₹{Number(receiptData.billing?.amountPaid || 0).toFixed(2)}</span>
                </div>
                {isPartiallyPaid && (
                  <div className="flex justify-between text-amber-400 print:text-amber-800 font-bold pt-1">
                    <span>Remaining Balance:</span>
                    <span>₹{Number(receiptData.billing?.balanceAmount || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Transactions Audit Log */}
            {receiptData.billing?.payments && receiptData.billing.payments.length > 0 && (
              <div className="pt-6 text-xs">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Transaction Audit History
                </h4>
                <div className="space-y-2">
                  {receiptData.billing.payments.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-white/5 border border-white/5 print:border-gray-200 text-[11px]"
                    >
                      <div>
                        <span className="font-semibold text-white print:text-black">
                          {p.paymentType === "INSTALLMENT_1"
                            ? "1st Installment Payment"
                            : p.paymentType === "INSTALLMENT_2"
                            ? "2nd Installment Payment"
                            : "Full Payment"}
                        </span>
                        <span className="text-slate-400 print:text-gray-500 ml-2">
                          ID: {p.paymentId}
                        </span>
                      </div>
                      <div className="text-slate-300 print:text-gray-700 mt-1 sm:mt-0 font-medium">
                        ₹{Number(p.amount).toFixed(2)} on{" "}
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : formattedPaymentDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="bg-[#11161d] border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading your verified payment receipt...</p>
          </div>
        ) : null}

        {/* Footer Support Notice */}
        <div className="text-center mt-8 text-xs text-slate-500 print:hidden">
          <p>
            Need help or have questions regarding your payment? Reach out to us at{" "}
            <a href="mailto:notify@smven.com" className="text-blue-400 underline">
              notify@smven.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
