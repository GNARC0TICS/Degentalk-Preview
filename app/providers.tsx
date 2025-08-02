'use client';

import React from 'react';
import { UIConfigProvider } from '@/contexts/UIConfigContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <UIConfigProvider>{children}</UIConfigProvider>;
}
