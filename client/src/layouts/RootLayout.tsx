import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteHeader, HeaderProvider } from '@/components/header';
import { SiteFooter } from '@/components/footer';

/**
 * Root Layout - Main application shell
 * Contains the site header, footer, and renders child pages via Outlet
 */
export default function RootLayout() {
  return (
    <HeaderProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </HeaderProvider>
  );
}