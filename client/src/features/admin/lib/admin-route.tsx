import type { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@app/hooks/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * AdminRoute - Verifies the user is authenticated and has admin privileges.
 * Navigates to /auth if not logged in, or / if not an admin.
 */
export function AdminRoute({ component: Component }: { component: ComponentType<any> }) {
	const { user, isLoading, isDevMode } = useAuth();

	// In development with a mock user, we still want to respect the role for admin routes
	// unless specifically bypassed for a different kind of testing.
	// For now, we'll strictly check the role even in dev mode if a user object exists.

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (user && user.role === 'admin') {
		return <Component />;
	}

	// If in dev mode and user is explicitly set to non-admin,
	// or in prod mode and user is not admin or not logged in.
	if (isDevMode && user && user.role !== 'admin') {
		// In dev, if logged in as non-admin, show an unauthorized message or redirect
		// console.warn(`[DEV] AdminRoute: Access to ${path} denied for mock role ${user.role}`);
		return <Navigate to="/" />; // Or a specific /unauthorized page
	}

	if (!user) {
		return <Navigate to="/auth" />;
	}

	// Default redirect for non-admin users in production
	return <Navigate to="/" />;
}
