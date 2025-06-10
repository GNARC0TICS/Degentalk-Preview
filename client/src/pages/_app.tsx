import React from 'react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';

// Corrected/New Imports
import { RootProvider } from '@/providers/root-provider';
import { SiteLayoutWrapper } from '@/components/layout/site-layout-wrapper';

import '@/styles/globals.css';
import '@/styles/zone-themes.css'; // Import zone theme styling

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			refetchOnWindowFocus: false
		}
	}
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="dark">
				<RootProvider>
					<SiteLayoutWrapper>
						<Component {...pageProps} />
					</SiteLayoutWrapper>
				</RootProvider>
			</ThemeProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
