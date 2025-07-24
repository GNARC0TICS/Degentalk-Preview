import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import XpToastProvider from '@app/contexts/XpToastContext';
import LevelUpProvider from '@app/contexts/LevelUpContext';

// Create a client
const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
				<LevelUpProvider>
					<XpToastProvider>{children}</XpToastProvider>
				</LevelUpProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
