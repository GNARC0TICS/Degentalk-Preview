
import React from 'react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from "@/components/ui/tooltip";

import '@/styles/globals.css';
import '@/styles/zone-themes.css'; // Import zone theme styling

import { SiteHeader } from '@/components/layout/site-header';
import { SiteLayoutWrapper } from '@/components/layout/site-layout-wrapper';
import { AuthProvider } from '@/contexts/auth-context';
import { ShoutboxProvider } from '@/contexts/shoutbox-context';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <ShoutboxProvider>
              <SiteLayoutWrapper>
                <Component {...pageProps} />
              </SiteLayoutWrapper>
            </ShoutboxProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
