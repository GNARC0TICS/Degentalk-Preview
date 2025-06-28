import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';
import type { RouteProps } from 'wouter';

type ProtectedRouteProps = {
	path: string;
	component: React.ComponentType<any>;
} & Omit<RouteProps, 'component' | 'path' | 'children'>;

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

export function ProtectedRoute({ path, component: Component, ...routeProps }: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();

	return (
		<Route path={path} {...routeProps}>
			{isLoading ? (
				<div className="flex items-center justify-center min-h-screen">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : user || isDevelopment ? (
				<Component />
			) : (
				<Redirect to="/auth" />
			)}
		</Route>
	);
}
