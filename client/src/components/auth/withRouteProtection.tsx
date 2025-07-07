import type { ReactNode, ComponentType } from 'react';
import { useLocation } from 'wouter';
import { ProtectedRoute } from './ProtectedRoute';
import { getRouteProtection } from '@/lib/routeConfig';

interface WithRouteProtectionOptions {
	fallback?: ReactNode;
	showError?: boolean;
	customRedirect?: string;
}

/**
 * Higher-order component that automatically applies route protection
 * based on the route configuration defined in routeConfig.ts
 */
export function withRouteProtection<P extends object>(
	Component: ComponentType<P>,
	options: WithRouteProtectionOptions = {}
) {
	return function ProtectedComponent(props: P) {
		const [location] = useLocation();
		const protection = getRouteProtection(location);

		return (
			<ProtectedRoute
				requireAuth={protection.requireAuth}
				minRole={protection.minRole}
				exactRole={protection.exactRole}
				redirectTo={options.customRedirect || protection.redirectTo}
				fallback={options.fallback}
				showError={options.showError ?? true}
			>
				<Component {...props} />
			</ProtectedRoute>
		);
	};
}

// Convenience HOCs for common patterns
export function withAuth<P extends object>(Component: ComponentType<P>) {
	return withRouteProtection(Component, { customRedirect: '/auth' });
}

export function withAdmin<P extends object>(Component: ComponentType<P>) {
	return function AdminProtectedComponent(props: P) {
		return (
			<ProtectedRoute minRole="admin" redirectTo="/" showError={true}>
				<Component {...props} />
			</ProtectedRoute>
		);
	};
}

export function withModerator<P extends object>(Component: ComponentType<P>) {
	return function ModeratorProtectedComponent(props: P) {
		return (
			<ProtectedRoute minRole="moderator" redirectTo="/" showError={true}>
				<Component {...props} />
			</ProtectedRoute>
		);
	};
}

export function withSuperAdmin<P extends object>(Component: ComponentType<P>) {
	return function SuperAdminProtectedComponent(props: P) {
		return (
			<ProtectedRoute exactRole="super_admin" redirectTo="/admin" showError={true}>
				<Component {...props} />
			</ProtectedRoute>
		);
	};
}
