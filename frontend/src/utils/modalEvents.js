/**
 * Utility to trigger modal opening from anywhere in the app
 * using CustomEvents to avoid prop drilling.
 */
export const openLeadModal = (type, isSuccess = false) => {
  window.dispatchEvent(new CustomEvent('open-lead-modal', { detail: { type, isSuccess } }));
};
