import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteHeader, HeaderProvider } from '@app/components/header';
import { SiteFooter } from '@app/components/footer';
import { AuthRedirectHandler } from '@app/components/auth/AuthRedirectHandler';

/**
 * Root Layout - Main application shell
 * Contains the site header, footer, and renders child pages via Outlet
 */
export default function RootLayout() {
  return (
    <HeaderProvider>
      <AuthRedirectHandler />
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