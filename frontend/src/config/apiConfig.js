export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running in production domain or Vercel preview, always ensure production API
    if (hostname.includes('smven.com') || hostname.endsWith('.vercel.app')) {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
      }
      return 'https://api.smven.com';
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};

export const API_URL = getApiUrl();
