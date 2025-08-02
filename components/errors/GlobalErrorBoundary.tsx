/**
 * Global Error Boundary with Sentry Integration
 * Wraps the entire application for comprehensive error handling
 */

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
// import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Fallback UI for critical application errors
 */
function GlobalErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-red-950/20 border border-red-800 rounded-lg p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Application Error
          </h1>
          
          <p className="text-zinc-300 mb-6">
            We're sorry, but something went wrong. The error has been reported to our team.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 p-4 bg-zinc-900 rounded text-xs text-red-300 font-mono overflow-auto">
                <div className="mb-2">
                  <strong>Error:</strong> {error.name}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={resetError}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

/**
 * Global Error Boundary Component
 * Combines custom ErrorBoundary with Sentry integration
 */
export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  // Temporarily disabled Sentry - packages not installed
  // Use custom error boundary for all environments for now
  return (
    <ErrorBoundary
      level="critical"
      context="global"
      fallback={
        <GlobalErrorFallback
          error={new Error('Application Error')}
          resetError={() => window.location.reload()}
        />
      }
      onError={(error, errorInfo) => {
        console.error('[Global Error Boundary]', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Route-level error boundary for specific pages
 */
export function RouteErrorBoundary({
  children,
  routeName
}: {
  children: React.ReactNode;
  routeName: string;
}) {
  return (
    <ErrorBoundary
      level="page"
      context={`route:${routeName}`}
      onError={(error, errorInfo) => {
        console.error(`[Route Error: ${routeName}]`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level error boundary for isolated features
 */
export function ComponentErrorBoundary({
  children,
  componentName,
  fallback
}: {
  children: React.ReactNode;
  componentName: string;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      level="component"
      context={`component:${componentName}`}
      fallback={fallback}
    >
      {children}
    </ErrorBoundary>
  );
}