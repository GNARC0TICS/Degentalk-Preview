'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('NextError', 'Application error occurred', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-red-950/20 border border-red-800 rounded-lg p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Something went wrong!
          </h1>
          
          <p className="text-zinc-300 mb-6">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 p-4 bg-zinc-900 rounded text-xs text-red-300 font-mono overflow-auto max-h-48">
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.digest && (
                  <div className="mb-2">
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={reset}
              variant="outline"
              className="gap-2 border-zinc-700 hover:bg-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}