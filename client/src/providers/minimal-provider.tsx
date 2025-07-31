import React from 'react';

interface MinimalProviderProps {
  children: React.ReactNode;
}

export function MinimalProvider({ children }: MinimalProviderProps) {
  return <>{children}</>;
}