/**
 * Application Initialization
 * Sets up monitoring, error tracking, and other global services
 */

import { initSentry } from './sentry';

/**
 * Initialize all application services
 */
export function initializeApp() {
  // Initialize Sentry for error tracking and APM
  initSentry();
  
  // Log app initialization
  if (process.env.NODE_ENV === 'development') {
    console.log('[App] Initializing DegenTalk...');
    console.log('[App] Environment:', process.env.NODE_ENV);
    console.log('[App] Version:', process.env.VITE_APP_VERSION || 'dev');
  }
  
  // Set up global error handlers
  setupGlobalErrorHandlers();
  
  // Initialize performance monitoring
  if ('performance' in window && 'measure' in window.performance) {
    performance.mark('app-init-complete');
  }
}

/**
 * Set up global error handlers for uncaught errors
 */
function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global] Unhandled promise rejection:', event.reason);
    
    // In production, these are automatically captured by Sentry
    // In development, we log them for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Promise rejection details:', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('[Global] Uncaught error:', event.error);
    
    // Prevent default error handling in production
    if (process.env.NODE_ENV === 'production') {
      event.preventDefault();
    }
  });
  
  // Log performance warnings in development
  if (process.env.NODE_ENV === 'development') {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) {
          console.warn('[Performance] Slow operation detected:', {
            name: entry.name,
            duration: `${entry.duration.toFixed(2)}ms`,
            type: entry.entryType
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }
}

/**
 * Clean up function for app teardown
 */
export function cleanupApp() {
  // Clean up any global listeners or resources
  if (process.env.NODE_ENV === 'development') {
    console.log('[App] Cleaning up...');
  }
}