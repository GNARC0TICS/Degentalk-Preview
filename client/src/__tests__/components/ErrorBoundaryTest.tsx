/**
 * Test component to verify ErrorBoundary and Sentry integration
 * This component intentionally throws an error for testing purposes
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ErrorBoundaryTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error from ErrorBoundaryTest component - This should be caught by the GlobalErrorBoundary and reported to Sentry');
  }

  return (
    <div className="p-4 border border-red-500 rounded-lg bg-red-950/20">
      <h3 className="text-lg font-bold text-red-400 mb-2">Error Boundary Test</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Click the button below to throw a test error. This will trigger the ErrorBoundary and send an event to Sentry.
      </p>
      <Button 
        variant="destructive"
        onClick={() => setShouldThrow(true)}
      >
        Throw Test Error
      </Button>
    </div>
  );
}