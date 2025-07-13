import type { ReactNode, ComponentType } from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { hasRoleAtLeast } from '@/lib/roles';
import type { Role } from '@/lib/roles';

interface RouteGuardProps {
	children: ReactNode;
	redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/auth' }: RouteGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div className="flex items-center justify-center p-8">Loading...</div>;
	}

	if (!isAuthenticated) {
		return <Redirect to={redirectTo} />;
	}

	return <>{children}</>;
}

interface RequireRoleProps extends RouteGuardProps {
	minRole?: Role;
	exactRole?: Role;
}

export function RequireRole({ children, minRole, exactRole, redirectTo = '/' }: RequireRoleProps) {
	const { user, isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div className="flex items-center justify-center p-8">Loading...</div>;
	}

	if (!isAuthenticated || !user) {
		return <Redirect to="/auth" />;
	}

	const userRole = user.role as Role;

	if (exactRole && userRole !== exactRole) {
		return <Redirect to={redirectTo} />;
	}

	if (minRole && !hasRoleAtLeast(userRole, minRole)) {
		return <Redirect to={redirectTo} />;
	}

	return <>{children}</>;
}

export function RequireAdmin({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole minRole="admin" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function RequireSuperAdmin({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole exactRole="super_admin" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function RequireModerator({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole minRole="moderator" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function RequireDev({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole exactRole="dev" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function RequireShoutboxMod({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole minRole="shoutbox_mod" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function RequireContentMod({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole minRole="content_mod" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function RequireMarketMod({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole minRole="market_mod" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function RequireTeamAccess({ children, redirectTo = '/' }: RouteGuardProps) {
	return (
		<RequireRole minRole="moderator" redirectTo={redirectTo}>
			{children}
		</RequireRole>
	);
}

export function PublicOnlyRoute({ children, redirectTo = '/' }: RouteGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div className="flex items-center justify-center p-8">Loading...</div>;
	}

	if (isAuthenticated) {
		return <Redirect to={redirectTo} />;
	}

	return <>{children}</>;
}

// Backwards compatibility component that works with wouter's Route pattern
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
