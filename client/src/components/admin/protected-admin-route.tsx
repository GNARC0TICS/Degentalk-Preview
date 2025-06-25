import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useAdminPermission } from '@/hooks/use-admin-modules';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ProtectedAdminRouteProps {
	children: React.ReactNode;
	moduleId: string;
	fallbackRoute?: string;
	requireExactPermission?: boolean;
	showLoadingSpinner?: boolean;
}

export function ProtectedAdminRoute({
	children,
	moduleId,
	fallbackRoute = '/admin',
	requireExactPermission = false,
	showLoadingSpinner = true,
}: ProtectedAdminRouteProps) {
	const { user, isLoading: authLoading } = useAuth();
	const { hasPermission, isLoading: permissionLoading } = useAdminPermission(moduleId);
	const location = useLocation();

	// Show loading state
	if (authLoading || permissionLoading) {
		if (!showLoadingSpinner) return null;
		
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						Checking permissions...
					</p>
				</div>
			</div>
		);
	}

	// Not authenticated
	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Not an admin/moderator
	if (!['admin', 'super_admin', 'moderator'].includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	// No permission for this specific module
	if (!hasPermission) {
		return (
			<div className="container mx-auto py-8">
				<AdminAccessDenied
					moduleId={moduleId}
					userRole={user.role}
					fallbackRoute={fallbackRoute}
					requireExactPermission={requireExactPermission}
				/>
			</div>
		);
	}

	// Permission granted, render the protected content
	return (
		<Suspense fallback={<AdminLoadingFallback />}>
			<AdminErrorBoundary moduleId={moduleId}>
				{children}
			</AdminErrorBoundary>
		</Suspense>
	);
}

// Loading fallback component for lazy-loaded admin modules
function AdminLoadingFallback() {
	return (
		<div className="flex items-center justify-center min-h-[600px]">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
				<div className="text-center">
					<h3 className="text-lg font-semibold">Loading Admin Module</h3>
					<p className="text-sm text-muted-foreground mt-1">
						Please wait while we load the requested admin panel...
					</p>
				</div>
			</div>
		</div>
	);
}

// Access denied component
function AdminAccessDenied({
	moduleId,
	userRole,
	fallbackRoute,
	requireExactPermission,
}: {
	moduleId: string;
	userRole: string;
	fallbackRoute: string;
	requireExactPermission: boolean;
}) {
	return (
		<div className="max-w-md mx-auto">
			<Alert variant="destructive">
				<Lock className="h-4 w-4" />
				<AlertDescription className="space-y-4">
					<div>
						<h3 className="font-semibold mb-2">Access Denied</h3>
						<p className="text-sm">
							You don't have permission to access this admin module.
						</p>
					</div>
					
					<div className="text-xs space-y-1 opacity-75">
						<p><strong>Module:</strong> {moduleId}</p>
						<p><strong>Your Role:</strong> {userRole}</p>
						{requireExactPermission && (
							<p><strong>Requirement:</strong> Exact permission match required</p>
						)}
					</div>
					
					<div className="flex gap-2">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => window.history.back()}
						>
							Go Back
						</Button>
						<Button 
							variant="secondary" 
							size="sm"
							onClick={() => window.location.href = fallbackRoute}
						>
							Admin Dashboard
						</Button>
					</div>
				</AlertDescription>
			</Alert>
		</div>
	);
}

// Error boundary for admin modules
class AdminErrorBoundary extends React.Component<
	{ children: React.ReactNode; moduleId: string },
	{ hasError: boolean; error?: Error }
> {
	constructor(props: { children: React.ReactNode; moduleId: string }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error(`Admin module error [${this.props.moduleId}]:`, error, errorInfo);
		
		// TODO: Send error to monitoring service
		// logError('admin-module-error', {
		// 	moduleId: this.props.moduleId,
		// 	error: error.message,
		// 	stack: error.stack,
		// 	errorInfo,
		// });
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="container mx-auto py-8">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="space-y-4">
							<div>
								<h3 className="font-semibold mb-2">Module Error</h3>
								<p className="text-sm">
									The admin module failed to load properly.
								</p>
							</div>
							
							<div className="text-xs space-y-1 opacity-75">
								<p><strong>Module:</strong> {this.props.moduleId}</p>
								{this.state.error && (
									<p><strong>Error:</strong> {this.state.error.message}</p>
								)}
							</div>
							
							<div className="flex gap-2">
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => window.location.reload()}
								>
									Reload Page
								</Button>
								<Button 
									variant="secondary" 
									size="sm"
									onClick={() => window.location.href = '/admin'}
								>
									Admin Dashboard
								</Button>
							</div>
						</AlertDescription>
					</Alert>
				</div>
			);
		}

		return this.props.children;
	}
}

// Higher-order component for wrapping admin pages
export function withAdminProtection(
	Component: React.ComponentType,
	moduleId: string,
	options?: Omit<ProtectedAdminRouteProps, 'children' | 'moduleId'>
) {
	return function ProtectedComponent(props: any) {
		return (
			<ProtectedAdminRoute moduleId={moduleId} {...options}>
				<Component {...props} />
			</ProtectedAdminRoute>
		);
	};
}

export default ProtectedAdminRoute;