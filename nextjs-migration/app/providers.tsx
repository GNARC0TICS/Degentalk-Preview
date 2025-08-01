'use client';

import React from 'react';
import { UIConfigProvider } from '@/contexts/UIConfigContext';

// Client-side providers wrapper
// This allows us to use context providers that require client-side functionality
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIConfigProvider>
      {children}
    </UIConfigProvider>
  );
}