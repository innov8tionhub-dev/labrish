import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/offlineSupport';
import { seoManager } from './lib/seo';
import { analytics } from './lib/analytics';

// Initialize SEO
seoManager.generateWebSiteStructuredData();
seoManager.generateOrganizationStructuredData();

// Register service worker for offline support
registerServiceWorker();

// Track initial page view
analytics.pageView(window.location.pathname, document.title);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);