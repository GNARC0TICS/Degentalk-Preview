import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { PurchaseModalProvider } from '@/hooks/use-purchase-modal';
import { ShoutboxProvider } from '@/contexts/shoutbox-context';
import { ForumStructureProvider } from '@/contexts/ForumStructureContext';
import { ForumThemeProvider } from '@/contexts/ForumThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProfileCardProvider } from '@/contexts/ProfileCardContext';
import { getQueryFn } from '@/lib/queryClient';

// Initialize React Query client - MAIN APPLICATION QUERY CLIENT
// This is the PRIMARY QueryClient instance used throughout the application
// Configuration:
// - on401: 'returnNull' - Returns null for 401 responses instead of throwing errors
//   This is essential for authentication flows where 401 means "not logged in"
// - refetchOnWindowFocus: false - Prevents unnecessary refetches on window focus
// - retry: 1 - Only retry failed requests once to avoid excessive network calls
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryFn: getQueryFn({ on401: 'returnNull' }), // Critical for auth flow
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
							<ForumStructureProvider>
								<ForumThemeProvider>
									<ProfileCardProvider>
										<TooltipProvider>{children}</TooltipProvider>
									</ProfileCardProvider>
								</ForumThemeProvider>
							</ForumStructureProvider>
						</ShoutboxProvider>
					</PurchaseModalProvider>
				</AuthProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}
