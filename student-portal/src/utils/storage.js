const SESSION_KEY = 'smven_student_session';

/**
 * Save lean session credentials to localStorage
 * @param {Object} sessionData
 * @param {string} sessionData.email
 * @param {string} [sessionData.studentId]
 * @param {string} [sessionData.token]
 * @param {number} [sessionData.expiresAt]
 */
export const saveSession = (sessionData) => {
  try {
    const payload = {
      email: sessionData.email,
      studentId: sessionData.studentId || null,
      token: sessionData.token || null,
      authenticatedAt: Date.now(),
      expiresAt: sessionData.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000, // default 7 days
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
};

/**
 * Retrieve saved session from localStorage
 * @returns {Object|null}
 */
export const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch (error) {
    console.error('Failed to read session from localStorage:', error);
    return null;
  }
};

/**
 * Clear session from localStorage
 */
export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
};
