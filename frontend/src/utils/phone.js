/**
 * Normalizes a phone number for the frontend.
 * 
 * @param {string} phone - The raw phone number
 * @returns {string} The normalized phone number
 */
export const normalizePhone = (phone) => {
    if (!phone) return "";

    // Remove spaces, dashes, special characters (keep + if present)
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");

    // If starts with +91, keep as-is (but remove any other symbols)
    if (cleaned.startsWith("+91")) {
        return "+" + cleaned.replace(/\D/g, "");
    }

    // Remove all non-digits for further checks
    const digits = cleaned.replace(/\D/g, "");

    // If starts with 91 and length is 12 -> +91XXXXXXXXXX
    if (digits.startsWith("91") && digits.length === 12) {
        return "+" + digits;
    }

    // If 10 digits -> +91XXXXXXXXXX
    if (digits.length === 10) {
        return "+91" + digits;
    }

    // Default E.164 attempt
    if (cleaned.startsWith("+")) {
        return "+" + cleaned.replace(/\D/g, "");
    }

    return "+" + digits;
};
