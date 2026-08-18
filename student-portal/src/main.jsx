import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import './styles/globals.css';
import App from './App.jsx';
import NetworkStatus from './components/common/NetworkStatus.jsx';

// Configure TanStack Query Client with optimal caching options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always refetch to stay in sync with database updates
      gcTime: 1000 * 60 * 30,    // 30 minutes garbage collection
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Configure LocalStorage persister for instant reloads & offline readiness
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'SMV_PORTAL_QUERY_CACHE',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }} // 24 hours persistence
    >
      <App />
      <NetworkStatus />
    </PersistQueryClientProvider>
  </StrictMode>
);
