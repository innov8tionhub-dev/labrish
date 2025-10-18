import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/offlineSupport';
import { seoManager } from './lib/seo';
import { analytics } from './lib/analytics';
import { reportWebVitals } from './lib/webVitals';

seoManager.generateWebSiteStructuredData();
seoManager.generateOrganizationStructuredData();

registerServiceWorker();

analytics.pageView(window.location.pathname, document.title);

reportWebVitals((metric) => {
  analytics.trackEvent('Web Vitals', {
    metric: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);