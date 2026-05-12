/**
 * Mask email for logging: john.doe@example.com -> j***e@example.com
 */
export const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "unknown";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
};

/**
 * Mask phone for logging: 919876543210 -> 91******3210
 */
export const maskPhone = (phone) => {
  if (!phone) return "unknown";
  const s = phone.toString();
  if (s.length <= 4) return "****";
  return `${s.slice(0, 2)}******${s.slice(-4)}`;
};
