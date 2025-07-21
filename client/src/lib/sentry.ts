/**
 * Sentry Error Tracking Configuration
 * Production-ready error monitoring and APM integration
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import type { User } from '@shared/types/entities';

// Environment configuration
const SENTRY_DSN = process.env.VITE_SENTRY_DSN || '';
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE = process.env.VITE_APP_VERSION || 'unknown';

/**
 * Initialize Sentry with comprehensive configuration
 */
export function initSentry() {
  if (!SENTRY_DSN || ENVIRONMENT === 'development') {
    console.log('[Sentry] Skipping initialization in development');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Set sampling to detect performance issues
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          window.history,
          ['/', '/forums', '/profile', '/admin']
        ),
        tracingOrigins: [
          'localhost',
          /^https:\/\/degentalk\.com/,
          /^https:\/\/api\.degentalk\.com/
        ],
      }),
      new Sentry.Replay({
        // Capture 10% of all sessions
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with an error
        errorSampleRate: 1.0,
        // Mask sensitive data
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Release Health
    autoSessionTracking: true,
    
    // Filtering
    ignoreErrors: [
      // Browser extensions
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      'The request timed out',
      // User actions
      'User cancelled',
      'User denied',
      'AbortError',
    ],
    
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox extensions
      /^moz-extension:\/\//i,
      // Safari extensions
      /^safari-extension:\/\//i,
    ],
    
    // Hooks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beforeSend(event, _hint) {
      // Filter out non-app errors
      if (event.exception && isThirdPartyError(event.exception)) {
        return null;
      }
      
      // Add custom context
      event.contexts = {
        ...event.contexts,
        app: {
          build_time: process.env.VITE_BUILD_TIME,
          git_commit: process.env.VITE_GIT_COMMIT,
        },
      };
      
      // Sanitize sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      
      return event;
    },
    
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }
      
      // Enhance navigation breadcrumbs
      if (breadcrumb.category === 'navigation') {
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: new Date().toISOString(),
        };
      }
      
      return breadcrumb;
    },
  });
}

/**
 * Check if error originates from third-party code
 */
function isThirdPartyError(exception: any): boolean {
  const frames = exception?.values?.[0]?.stacktrace?.frames;
  if (!frames || frames.length === 0) return false;
  
  return frames.some((frame: any) => {
    const filename = frame.filename || '';
    return (
      filename.includes('node_modules') ||
      filename.includes('vendor') ||
      filename.includes('polyfill') ||
      !filename.includes(window.location.hostname)
    );
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: User | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  
  Sentry.setUser({
    id: user.id,
    username: user.username,
    email: user.email,
    // Add custom user properties
    role: user.role,
    level: user.level,
    verified: user.isEmailVerified,
  });
}

/**
 * Add custom context to errors
 */
export function setSentryContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context);
}

/**
 * Track custom events
 */
export function trackEvent(name: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message: name,
    category: 'custom',
    level: 'info',
    data,
  });
}

/**
 * Capture exception with additional context
 */
export function captureException(
  error: Error,
  context?: {
    level?: Sentry.SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: User;
  }
) {
  if (context?.user) {
    setSentryUser(context.user);
  }
  
  Sentry.captureException(error, {
    level: context?.level || 'error',
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Capture message with context
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Performance monitoring transaction
 */
export function startTransaction(name: string, op: string = 'navigation') {
  return Sentry.startTransaction({ name, op });
}

/**
 * Profile a function execution
 */
export async function profileFunction<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, 'function');
  
  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * Create error boundary fallback component with Sentry
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * HOC for route-based error boundaries
 */
export function withSentryRouting<P extends object>(
  Component: React.ComponentType<P>,
  route: string
) {
  const ErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error, resetError }) => {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-black flex items-center justify-center p-4' },
      React.createElement(
        'div',
        { className: 'max-w-lg w-full bg-red-950/20 border border-red-800 rounded-lg p-6' },
        React.createElement(
          'h1',
          { className: 'text-2xl font-bold text-red-400 mb-4' },
          `Error in ${route}`
        ),
        React.createElement(
          'p',
          { className: 'text-zinc-300 mb-4' },
          error.message
        ),
        React.createElement(
          'button',
          {
            onClick: resetError,
            className: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
          },
          'Try Again'
        )
      )
    );
  };

  return Sentry.withErrorBoundary(Component, {
    fallback: ErrorFallback,
    showDialog: ENVIRONMENT !== 'production',
  });
}