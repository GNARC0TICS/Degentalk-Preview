import type { ComponentType } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';
import type { RouteProps } from 'wouter';

type ProtectedRouteProps = {
	path: string;
	component: ComponentType<any>;
} & Omit<RouteProps, 'component' | 'path' | 'children'>;

export function ProtectedRoute({ path, component: Component, ...routeProps }: ProtectedRouteProps) {
	const { user, isLoading, isAuthenticated } = useAuth();

	return (
		<Route path={path} {...routeProps}>
			{isLoading ? (
				<div className="flex items-center justify-center min-h-screen">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : isAuthenticated ? (
				<Component />
			) : (
				<Redirect to="/auth" />
			)}
		</Route>
	);
}
