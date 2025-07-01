import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { hasRoleAtLeast } from '@/lib/roles';
import type { Role } from '@/lib/roles';
import { Redirect } from 'wouter';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
	children: React.ReactNode;
	minRole?: Role;
	exactRole?: Role;
	requireAuth?: boolean;
	redirectTo?: string;
	fallback?: React.ReactNode;
	showError?: boolean;
}

export function ProtectedRoute({
	children,
	minRole,
	exactRole,
	requireAuth = true,
	redirectTo = '/auth',
	fallback,
	showError = true
}: ProtectedRouteProps) {
	const { user, isLoading, isAuthenticated } = useAuth();

	// Show loading state while auth is being determined
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
				<span className="ml-2 text-gray-600">Checking permissions...</span>
			</div>
		);
	}

	// Check authentication requirement
	if (requireAuth && !isAuthenticated) {
		if (fallback) return <>{fallback}</>;
		return <Redirect to={redirectTo} />;
	}

	// If no role requirements, just check auth
	if (!minRole && !exactRole) {
		return <>{children}</>;
	}

	// Role-based access control
	if (user && (minRole || exactRole)) {
		const userRole = user.role as Role;

		// Check exact role match
		if (exactRole && userRole !== exactRole) {
			if (fallback) return <>{fallback}</>;

			if (showError) {
				return (
					<div className="container mx-auto py-8 max-w-md">
						<Alert className="border-red-200">
							<Lock className="h-4 w-4 text-red-500" />
							<AlertDescription className="text-red-700">
								<div className="space-y-3">
									<p className="font-medium">Access Restricted</p>
									<p className="text-sm">
										This area requires exactly <strong>{exactRole}</strong> role. Your current role:{' '}
										<strong>{userRole}</strong>
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() => window.history.back()}
										className="mt-2"
									>
										Go Back
									</Button>
								</div>
							</AlertDescription>
						</Alert>
					</div>
				);
			}

			return <Redirect to="/" />;
		}

		// Check minimum role requirement
		if (minRole && !hasRoleAtLeast(userRole, minRole)) {
			if (fallback) return <>{fallback}</>;

			if (showError) {
				return (
					<div className="container mx-auto py-8 max-w-md">
						<Alert className="border-orange-200">
							<AlertCircle className="h-4 w-4 text-orange-500" />
							<AlertDescription className="text-orange-700">
								<div className="space-y-3">
									<p className="font-medium">Insufficient Permissions</p>
									<p className="text-sm">
										This area requires minimum <strong>{minRole}</strong> role. Your current role:{' '}
										<strong>{userRole}</strong>
									</p>
									<div className="flex gap-2 mt-2">
										<Button variant="outline" size="sm" onClick={() => window.history.back()}>
											Go Back
										</Button>
										<Button
											variant="default"
											size="sm"
											onClick={() => (window.location.href = '/contact')}
										>
											Request Access
										</Button>
									</div>
								</div>
							</AlertDescription>
						</Alert>
					</div>
				);
			}

			return <Redirect to="/" />;
		}
	}

	// All checks passed
	return <>{children}</>;
}
