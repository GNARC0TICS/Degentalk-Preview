'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    function sendToAnalytics(metric: any) {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals]', metric.name, Math.round(metric.value), {
          rating: metric.rating,
          path: window.location.pathname,
        });
      }

      // You can send to your analytics service here
      // For now, we'll just use console logging
      const body = {
        metric: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        path: window.location.pathname,
      };

      // Example: send to your analytics endpoint
      // fetch('/api/vitals', {
      //   method: 'POST',
      //   body: JSON.stringify(body),
      // });
    }

    // Register all Web Vitals
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  }, []);

  return null;
}