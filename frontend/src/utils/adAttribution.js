const STORAGE_KEY = 'smven_ad_attribution';

export function captureAdAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);

    const keys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'fbclid',
    ];

    const incoming = {};

    keys.forEach((key) => {
      const value = params.get(key);
      if (value) incoming[key] = value;
    });

    const existing = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || '{}'
    );

    const attribution = {
      ...existing,
      ...incoming,
      landingPage:
        existing.landingPage ||
        `${window.location.pathname}${window.location.search}`,
      referrer: existing.referrer || document.referrer || null,
      capturedAt: existing.capturedAt || new Date().toISOString(),
    };

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(attribution)
    );

    return attribution;
  } catch (error) {
    console.error('Could not capture ad attribution:', error);
    return {};
  }
}

export function getAdAttribution() {
  try {
    return JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || '{}'
    );
  } catch {
    return {};
  }
}
