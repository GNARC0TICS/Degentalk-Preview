import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { getRouteProtection } from '@/lib/routeConfig';
import { hasRoleAtLeast } from '@/lib/roles';
import type { Role } from '@/lib/roles';

interface GlobalRouteGuardProps {
	children: ReactNode;
	onUnauthorizedAccess?: (path: string, reason: string) => void;
	enableLogging?: boolean;
}

/**
 * Global route guard that monitors all route changes and logs access attempts.
 * This doesn't block access but provides monitoring and analytics.
 */
export function GlobalRouteGuard({
	children,
	onUnauthorizedAccess,
	enableLogging = process.env.NODE_ENV === 'development'
}: GlobalRouteGuardProps) {
	const [location] = useLocation();
	const { user, isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		// Skip during loading
		if (isLoading) return;

		const protection = getRouteProtection(location);

		// Check if route has protection requirements
		if (!protection.requireAuth && !protection.minRole && !protection.exactRole) {
			if (enableLogging) {
				// console.log(`[ROUTE] ✅ Public route accessed: ${location}`);
			}
			return;
		}

		// Authentication check
		if (protection.requireAuth && !isAuthenticated) {
			if (enableLogging) {
				// console.warn(`[ROUTE] ❌ Unauthenticated access attempt: ${location}`);
			}
			onUnauthorizedAccess?.(location, 'Authentication required');
			return;
		}

		// Role-based checks
		if (user && (protection.minRole || protection.exactRole)) {
			const userRole = user.role as Role;

			// Exact role check
			if (protection.exactRole && userRole !== protection.exactRole) {
				if (enableLogging) {
					// console.warn - insufficient role for route
				}
				onUnauthorizedAccess?.(location, `Requires exactly ${protection.exactRole} role`);
				return;
			}

			// Minimum role check
			if (protection.minRole && !hasRoleAtLeast(userRole, protection.minRole)) {
				if (enableLogging) {
					// console.warn - insufficient minimum role for route
				}
				onUnauthorizedAccess?.(location, `Requires minimum ${protection.minRole} role`);
				return;
			}

			if (enableLogging) {
				// console.log(`[ROUTE] ✅ Authorized access: ${location} (${userRole})`);
			}
		}
	}, [location, user, isAuthenticated, isLoading, onUnauthorizedAccess, enableLogging]);

	return <>{children}</>;
}

// Analytics hook for tracking route access patterns
export function useRouteAnalytics() {
	const [location] = useLocation();
	const { user } = useAuth();

	useEffect(() => {
		// Track route access for analytics
		const trackData = {
			path: location,
			timestamp: new Date().toISOString(),
			user: user
				? {
						id: user.id,
						role: user.role,
						level: user.level
					}
				: null
		};

		// Send to analytics service (implement as needed)
		if (process.env.NODE_ENV === 'production') {
			// analytics.track('route_access', trackData);
		}
	}, [location, user]);
}
