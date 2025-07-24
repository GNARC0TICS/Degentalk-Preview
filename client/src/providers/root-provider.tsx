import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@app/hooks/use-auth';
import { PurchaseModalProvider } from '@app/hooks/use-purchase-modal';
import { ShoutboxProvider } from '@app/contexts/shoutbox-context';
import { ForumStructureProvider } from '@app/features/forum/contexts/ForumStructureContext';
import { ForumThemeProvider } from '@app/features/forum/contexts/ForumThemeProvider';
import { TooltipProvider } from '@app/components/ui/tooltip';
import { ProfileCardProvider } from '@app/contexts/ProfileCardContext';
import { MotionProvider } from '@app/contexts/MotionContext';
import { getQueryFn } from '@app/utils/queryClient';
import { ForumOrderingProvider } from '@app/features/forum/contexts/ForumOrderingContext';
import { WebSocketProvider } from '@app/hooks/useWebSocket';
import { ThemeProvider } from 'next-themes';

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
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<WebSocketProvider>
							<PurchaseModalProvider>
								<ShoutboxProvider>
									<ForumStructureProvider>
										<ForumOrderingProvider>
											<ForumThemeProvider>
												<MotionProvider>
													<ProfileCardProvider>
														<TooltipProvider>{children}</TooltipProvider>
													</ProfileCardProvider>
												</MotionProvider>
											</ForumThemeProvider>
										</ForumOrderingProvider>
									</ForumStructureProvider>
								</ShoutboxProvider>
							</PurchaseModalProvider>
						</WebSocketProvider>
					</AuthProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</React.StrictMode>
	);
}
