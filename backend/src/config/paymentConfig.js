/**
 * Payment and Tax Configuration for SMVEN.
 * All monetary amounts in calculations use integer paise to avoid floating-point errors.
 */

export const PAYMENT_CONFIG = {
  currency: "INR",
  // 18% GST rate, configurable
  gstRate: 0.18,
  gstRatePercent: 18,
  installmentDueDays: 30,

  // Option A: Full Payment
  fullPayment: {
    originalPrice: 20000,
    baseAmount: 9999, // Course fee excluding GST
    discountPercent: 50.01,
    displayLabel: "GST excluded",
  },

  // Option B: 2 Installments
  installmentPlan: {
    originalPrice: 20000,
    totalBaseAmount: 11000, // Total course fee excluding GST
    discountPercent: 45,
    displayLabel: "GST excluded",
    installmentDueDays: 30,
    firstInstallment: {
      installmentNumber: 1,
      baseAmount: 7000,
    },
    secondInstallment: {
      installmentNumber: 2,
      baseAmount: 4000,
    },
  },

  // Business details for Invoicing / Receipts
  business: {
    name: "Smart Mate Ventures",
    email: process.env.FROM_EMAIL || "notify@smven.com",
    website: "https://smven.com",
    address: "India",
    gstin: process.env.BUSINESS_GSTIN || "", // Configurable via environment, not hardcoded
  },

  // Backward compatibility properties (GST-inclusive payable totals in Rupees)
  totalAmount: 11798.82,
  firstInstallmentAmount: 8260,
  secondInstallmentAmount: 4720,
};

/**
 * Calculates GST and total amount in paise (integer) and rupees.
 * @param {number} baseAmountInRupees
 * @param {number} [gstRate]
 */
export function calculateGst(baseAmountInRupees, gstRate = PAYMENT_CONFIG.gstRate) {
  const basePaise = Math.round(baseAmountInRupees * 100);
  const gstPaise = Math.round(basePaise * gstRate);
  const totalPaise = basePaise + gstPaise;

  return {
    baseAmount: basePaise / 100,
    basePaise,
    gstRate,
    gstRatePercent: Math.round(gstRate * 100),
    gstAmount: gstPaise / 100,
    gstPaise,
    totalAmount: totalPaise / 100,
    totalPaise,
  };
}

/**
 * Returns complete pricing breakdown for the chosen plan.
 * @param {"FULL" | "TWO_INSTALLMENTS"} plan
 * @param {1 | 2} [installmentNumber=1]
 */
export function getPlanPricing(plan = "FULL", installmentNumber = 1) {
  if (plan === "TWO_INSTALLMENTS") {
    const first = calculateGst(PAYMENT_CONFIG.installmentPlan.firstInstallment.baseAmount);
    const second = calculateGst(PAYMENT_CONFIG.installmentPlan.secondInstallment.baseAmount);
    const totalBasePaise = first.basePaise + second.basePaise; // 1,100,000 paise
    const totalGstPaise = first.gstPaise + second.gstPaise; // 198,000 paise
    const totalPayablePaise = totalBasePaise + totalGstPaise; // 1,298,000 paise

    return {
      plan: "TWO_INSTALLMENTS",
      originalPrice: PAYMENT_CONFIG.installmentPlan.originalPrice,
      discountPercent: PAYMENT_CONFIG.installmentPlan.discountPercent,
      displayLabel: PAYMENT_CONFIG.installmentPlan.displayLabel,
      totalCourseFee: totalBasePaise / 100, // 11000
      totalCourseFeePaise: totalBasePaise,
      totalGstAmount: totalGstPaise / 100, // 1980
      totalGstPaise,
      totalPayable: totalPayablePaise / 100, // 12980
      totalPayablePaise,
      installmentDueDays: PAYMENT_CONFIG.installmentDueDays,
      firstInstallment: {
        installmentNumber: 1,
        courseFee: first.baseAmount, // 7000
        courseFeePaise: first.basePaise,
        gstRatePercent: first.gstRatePercent,
        gstAmount: first.gstAmount, // 1260
        gstPaise: first.gstPaise,
        payableAmount: first.totalAmount, // 8260
        payablePaise: first.totalPaise, // 826000
      },
      secondInstallment: {
        installmentNumber: 2,
        courseFee: second.baseAmount, // 4000
        courseFeePaise: second.basePaise,
        gstRatePercent: second.gstRatePercent,
        gstAmount: second.gstAmount, // 720
        gstPaise: second.gstPaise,
        payableAmount: second.totalAmount, // 4720
        payablePaise: second.totalPaise, // 472000
      },
      currentInstallment: installmentNumber === 2 ? second : first,
    };
  }

  // Default: Full Payment
  const full = calculateGst(PAYMENT_CONFIG.fullPayment.baseAmount);
  return {
    plan: "FULL",
    originalPrice: PAYMENT_CONFIG.fullPayment.originalPrice,
    discountPercent: PAYMENT_CONFIG.fullPayment.discountPercent,
    displayLabel: PAYMENT_CONFIG.fullPayment.displayLabel,
    courseFee: full.baseAmount, // 9999
    courseFeePaise: full.basePaise, // 999900
    gstRatePercent: full.gstRatePercent, // 18
    gstAmount: full.gstAmount, // 1799.82
    gstPaise: full.gstPaise, // 179982
    totalPayable: full.totalAmount, // 11798.82
    totalPayablePaise: full.totalPaise, // 1179882
  };
}
