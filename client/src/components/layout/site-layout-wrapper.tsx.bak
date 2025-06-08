import React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

interface SiteLayoutWrapperProps {
  children: React.ReactNode;
}

export function SiteLayoutWrapper({ children }: SiteLayoutWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
