import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { hasRoleAtLeast } from '@/utils/roles';
import type { Role } from '@/utils/roles';

interface RouteProtectionResult {
	canAccess: boolean;
	isLoading: boolean;
	user: any;
	reason?: string;
}

export function useRouteProtection(
	minRole?: Role,
	exactRole?: Role,
	requireAuth: boolean = true
): RouteProtectionResult {
	const { user, isLoading, isAuthenticated } = useAuth();

	return useMemo(() => {
		// Still loading auth state
		if (isLoading) {
			return {
				canAccess: false,
				isLoading: true,
				user: null
			};
		}

		// Check authentication requirement
		if (requireAuth && !isAuthenticated) {
			return {
				canAccess: false,
				isLoading: false,
				user: null,
				reason: 'Authentication required'
			};
		}

		// If no role requirements, just check auth
		if (!minRole && !exactRole) {
			return {
				canAccess: !requireAuth || isAuthenticated,
				isLoading: false,
				user
			};
		}

		// Role-based access control
		if (user && (minRole || exactRole)) {
			const userRole = user.role as Role;

			// Check exact role match
			if (exactRole && userRole !== exactRole) {
				return {
					canAccess: false,
					isLoading: false,
					user,
					reason: `Requires exactly ${exactRole} role, but user has ${userRole}`
				};
			}

			// Check minimum role requirement
			if (minRole && !hasRoleAtLeast(userRole, minRole)) {
				return {
					canAccess: false,
					isLoading: false,
					user,
					reason: `Requires minimum ${minRole} role, but user has ${userRole}`
				};
			}

			// All role checks passed
			return {
				canAccess: true,
				isLoading: false,
				user
			};
		}

		// Default: no access
		return {
			canAccess: false,
			isLoading: false,
			user,
			reason: 'Access denied'
		};
	}, [user, isLoading, isAuthenticated, minRole, exactRole, requireAuth]);
}

// Convenience hooks for common protection patterns
export function useRequireAuth() {
	return useRouteProtection(undefined, undefined, true);
}

export function useRequireAdmin() {
	return useRouteProtection('admin');
}

export function useRequireSuperAdmin() {
	return useRouteProtection(undefined, 'super_admin');
}

export function useRequireModerator() {
	return useRouteProtection('moderator');
}

export function useRequireRole(role: Role, exact: boolean = false) {
	return useRouteProtection(exact ? undefined : role, exact ? role : undefined);
}
