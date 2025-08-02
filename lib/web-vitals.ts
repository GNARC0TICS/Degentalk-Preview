import { onCLS, onFCP, onLCP, onTTFB, onINP, CLSMetric, FCPMetric, LCPMetric, TTFBMetric, INPMetric } from 'web-vitals';
import { logger } from '@/lib/logger';

type Metric = CLSMetric | FCPMetric | LCPMetric | TTFBMetric | INPMetric;

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  return conn ? conn.effectiveType : 'unknown';
}

export function sendToAnalytics(metric: Metric) {
  const body = {
    dsn: process.env.NEXT_PUBLIC_ANALYTICS_ID || 'degentalk',
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('WebVitals', `${metric.name}: ${metric.value}`, {
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      path: window.location.pathname,
    });
  }

  // Send to analytics endpoint
  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
  }
}

export function reportWebVitals() {
  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  } catch (err) {
    logger.error('WebVitals', 'Failed to initialize', err as Error);
  }
}