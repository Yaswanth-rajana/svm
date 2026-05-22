/**
 * Utility to trigger opening the Webinar Benefits Modal from anywhere in the app
 * using CustomEvents to avoid prop drilling.
 */
export const openBenefitsModal = () => {
  window.dispatchEvent(new CustomEvent('open-benefits-modal'));
};
