/**
 * Normalizes a phone number to E.164 format (+91XXXXXXXXXX).
 * 
 * Rules:
 * 1. Remove all non-numeric characters except '+'
 * 2. If starts with '91' and length is 12 -> add '+'
 * 3. If starts with '+91' -> keep as-is
 * 4. If length is 10 -> add '+91'
 * 
 * @param {string} phone - The raw phone number
 * @returns {string|null} The normalized phone number or null if invalid
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return null;

  // 1. Remove all non-numeric characters, but keep '+' if it's at the start
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If the user entered something like "+ 91 123-456", it becomes "+91123456"
  // If they entered "91123456", it stays "91123456"

  // 2. Handle Indian Numbers specifically as per requirements
  
  // Case: Starts with +91 (E.164 already)
  if (cleaned.startsWith('+91')) {
    // Ensure only digits after +
    const digitsOnly = cleaned.slice(1).replace(/\D/g, '');
    if (digitsOnly.length === 12) {
      return '+' + digitsOnly;
    }
    // If it's just +91 followed by 10 digits
    if (digitsOnly.length === 11 && digitsOnly.startsWith('91')) {
       // already has 91, so it's +91XXXXXXXXXX
    }
    // If it's + followed by 10 digits
    if (digitsOnly.length === 10) {
      return '+91' + digitsOnly;
    }
  }

  // Case: Starts with 91 and length is 12 (e.g. 919123456789)
  const allDigits = cleaned.replace(/\D/g, '');
  if (allDigits.length === 12 && allDigits.startsWith('91')) {
    return '+' + allDigits;
  }

  // Case: 10-digit number (e.g. 9123456789)
  if (allDigits.length === 10) {
    return '+91' + allDigits;
  }

  // General fallback for E.164 if it starts with +
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Final fallback: if it's 12 digits but doesn't have +, add it if it's likely a country code
  if (allDigits.length >= 10 && allDigits.length <= 15) {
     if (allDigits.length === 12 && allDigits.startsWith('91')) {
       return '+' + allDigits;
     }
     if (allDigits.length === 10) {
       return '+91' + allDigits;
     }
     // If it's 12 digits but not starting with 91, we might not know the country, 
     // but the requirement says if it's 12 and starts with 91, convert to +91.
  }

  // Standard normalization for Indian context if no country code
  if (allDigits.length === 10) {
    return '+91' + allDigits;
  }

  return cleaned.startsWith('+') ? cleaned : '+' + allDigits;
};

/**
 * More robust implementation based on exact requirements.
 */
export const normalizePhone = (phone) => {
    if (!phone) return null;

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
}
