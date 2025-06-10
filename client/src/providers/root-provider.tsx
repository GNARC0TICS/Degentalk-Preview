import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { PurchaseModalProvider } from '@/hooks/use-purchase-modal';
import { ShoutboxProvider } from '@/contexts/shoutbox-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getQueryFn } from '@/lib/queryClient';

// Initialize React Query client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryFn: getQueryFn({ on401: 'returnNull' }),
			refetchOnWindowFocus: false,
			retry: 1
		}
	}
});

/**
 * RootProvider
 *
 * Central provider composition that ensures correct nesting order.
 * This is the ONLY place where context providers should be defined.
 *
 * IMPORTANT: Never add duplicate providers anywhere else in the application.
 */
export function RootProvider({ children }: { children: React.ReactNode }) {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<PurchaseModalProvider>
						<ShoutboxProvider>
							<TooltipProvider>{children}</TooltipProvider>
						</ShoutboxProvider>
					</PurchaseModalProvider>
				</AuthProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}
