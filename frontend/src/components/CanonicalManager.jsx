import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CANONICAL_MAP = {
  '/': 'https://smven.com/',
  '/cloud-computing': 'https://smven.com/cloud-computing',
  '/devops-engineering': 'https://smven.com/devops-engineering',
  '/virtualization-engineering': 'https://smven.com/virtualization-engineering',
  '/server-engineering': 'https://smven.com/server-engineering',
  '/storage-engineering': 'https://smven.com/storage-engineering',
  '/backup-engineering': 'https://smven.com/backup-engineering',
};

export default function CanonicalManager() {
  const location = useLocation();

  useEffect(() => {
    const rawPath = location.pathname || '/';
    const normalizedPath = rawPath.length > 1 && rawPath.endsWith('/')
      ? rawPath.slice(0, -1)
      : rawPath;

    const canonicalUrl = CANONICAL_MAP[normalizedPath];
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');

    if (canonicalUrl) {
      let canonicalTag = existingCanonicals[0];
      if (canonicalTag) {
        canonicalTag.setAttribute('href', canonicalUrl);
        // Clean up any extraneous duplicate tags
        for (let i = 1; i < existingCanonicals.length; i++) {
          existingCanonicals[i].remove();
        }
      } else {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        canonicalTag.setAttribute('href', canonicalUrl);
        document.head.appendChild(canonicalTag);
      }
    } else {
      // For private/transactional routes (e.g. payment-success, payment-failed, claim-certificate),
      // remove canonical tag so it does not leak
      existingCanonicals.forEach((el) => el.remove());
    }
  }, [location.pathname]);

  return null;
}

