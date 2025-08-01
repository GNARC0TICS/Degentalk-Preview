'use client';

import React from 'react';
import { UIConfigProvider } from '@/contexts/UIConfigContext';
import { HeaderProvider } from '@/components/header/HeaderContext';

// Client-side providers wrapper
// This allows us to use context providers that require client-side functionality
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIConfigProvider>
      <HeaderProvider>
        {children}
      </HeaderProvider>
    </UIConfigProvider>
  );
}