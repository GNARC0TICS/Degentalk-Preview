'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('GlobalError', 'Critical application error', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="bg-red-950/20 border border-red-800 rounded-lg p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-red-400 mb-4">
                Critical Error
              </h1>
              
              <p className="text-zinc-300 mb-6">
                A critical error occurred that prevented the application from loading.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}