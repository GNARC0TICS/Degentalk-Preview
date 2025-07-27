import type { ReactNode, ComponentType } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { hasRoleAtLeast } from '@/utils/roles';
import type { Role } from '@/utils/roles';

interface RouteGuardProps {
	children: ReactNode;
	redirectTo?: string;
	fallback?: ReactNode;
}

export function RequireAuth({ children, redirectTo = '/auth', fallback }: RouteGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div className="flex items-center justify-center p-8">Loading...</div>;
	}

	if (!isAuthenticated) {
		return fallback ? <>{fallback}</> : <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
}

interface RequireRoleProps extends RouteGuardProps {
	minRole?: Role;
	exactRole?: Role;
}

export function RequireRole({ children, minRole, exactRole, redirectTo = '/', fallback }: RequireRoleProps) {
	const { user, isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div className="flex items-center justify-center p-8">Loading...</div>;
	}

	if (!isAuthenticated || !user) {
		return fallback ? <>{fallback}</> : <Navigate to="/auth" />;
	}

	const userRole = user.role as Role;

	if (exactRole && userRole !== exactRole) {
		return fallback ? <>{fallback}</> : <Navigate to={redirectTo} />;
	}

	if (minRole && !hasRoleAtLeast(userRole, minRole)) {
		return fallback ? <>{fallback}</> : <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
}

export function RequireAdmin({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole minRole="admin" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function RequireSuperAdmin({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole exactRole="super_admin" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function RequireModerator({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole minRole="moderator" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function RequireDev({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole exactRole="dev" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function RequireShoutboxMod({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole minRole="shoutbox_mod" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function RequireContentMod({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole minRole="content_mod" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function RequireMarketMod({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole minRole="market_mod" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function RequireTeamAccess({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	return (
		<RequireRole minRole="moderator" redirectTo={redirectTo} fallback={fallback}>
			{children}
		</RequireRole>
	);
}

export function PublicOnlyRoute({ children, redirectTo = '/', fallback }: RouteGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div className="flex items-center justify-center p-8">Loading...</div>;
	}

	if (isAuthenticated) {
		return fallback ? <>{fallback}</> : <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
}

// Route guards for react-router-dom
interface ProtectedRouteProps {
	path?: string;
	component?: ComponentType<any>;
	children?: ReactNode;
}

export function ProtectedRoute({ path, component: Component, children }: ProtectedRouteProps) {
	// If used as a wrapper component (with children)
	if (!path && children) {
		return <RequireAuth>{children}</RequireAuth>;
	}

	// If used as a route component (with path and component)
	if (path && Component) {
		return (
			<Route path={path}>
				<RequireAuth>
					<Component />
				</RequireAuth>
			</Route>
		);
	}

	throw new Error('ProtectedRoute requires either (path + component) or children');
}

// Re-export GlobalRouteGuard for monitoring
export { GlobalRouteGuard } from './GlobalRouteGuard';
