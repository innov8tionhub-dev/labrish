export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
}

interface PerformanceNavigationTiming extends PerformanceEntry {
  responseStart: number;
  requestStart: number;
}

const thresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export function onCLS(callback: (metric: WebVitalsMetric) => void): void {
  let clsValue = 0;
  let clsEntries: LayoutShift[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShift[]) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
      }
    }

    callback({
      name: 'CLS',
      value: clsValue,
      rating: getRating('CLS', clsValue),
      delta: clsValue,
      id: `cls-${Date.now()}`,
    });
  });

  observer.observe({ type: 'layout-shift', buffered: true });
}

export function onFCP(callback: (metric: WebVitalsMetric) => void): void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        callback({
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('FCP', entry.startTime),
          delta: entry.startTime,
          id: `fcp-${Date.now()}`,
        });
        observer.disconnect();
      }
    }
  });

  observer.observe({ type: 'paint', buffered: true });
}

export function onLCP(callback: (metric: WebVitalsMetric) => void): void {
  let lcpValue = 0;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry;
    lcpValue = lastEntry.startTime;

    callback({
      name: 'LCP',
      value: lcpValue,
      rating: getRating('LCP', lcpValue),
      delta: lcpValue,
      id: `lcp-${Date.now()}`,
    });
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

export function onFID(callback: (metric: WebVitalsMetric) => void): void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEventTiming[]) {
      callback({
        name: 'FID',
        value: entry.processingStart - entry.startTime,
        rating: getRating('FID', entry.processingStart - entry.startTime),
        delta: entry.processingStart - entry.startTime,
        id: `fid-${Date.now()}`,
      });
      observer.disconnect();
    }
  });

  observer.observe({ type: 'first-input', buffered: true });
}

export function onTTFB(callback: (metric: WebVitalsMetric) => void): void {
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navEntry) {
    const ttfb = navEntry.responseStart - navEntry.requestStart;
    callback({
      name: 'TTFB',
      value: ttfb,
      rating: getRating('TTFB', ttfb),
      delta: ttfb,
      id: `ttfb-${Date.now()}`,
    });
  }
}

export function onINP(callback: (metric: WebVitalsMetric) => void): void {
  let maxDuration = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEventTiming[]) {
      const duration = entry.processingEnd - entry.startTime;
      if (duration > maxDuration) {
        maxDuration = duration;
        callback({
          name: 'INP',
          value: maxDuration,
          rating: getRating('INP', maxDuration),
          delta: maxDuration,
          id: `inp-${Date.now()}`,
        });
      }
    }
  });

  observer.observe({ type: 'event', buffered: true, durationThreshold: 40 });
}

export function reportWebVitals(onReport?: (metric: WebVitalsMetric) => void): void {
  if (!onReport) {
    onReport = (metric) => {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
      });
    };
  }

  if (typeof PerformanceObserver === 'undefined') {
    return;
  }

  try {
    onCLS(onReport);
    onFCP(onReport);
    onLCP(onReport);
    onFID(onReport);
    onTTFB(onReport);
    onINP(onReport);
  } catch (error) {
    console.error('Error reporting web vitals:', error);
  }
}
