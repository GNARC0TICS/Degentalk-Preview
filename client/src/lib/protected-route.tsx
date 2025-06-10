import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Redirect, Route } from 'wouter';

export function ProtectedRoute({
	path,
	component: Component
}: {
	path: string;
	component: () => React.JSX.Element;
}) {
	// Bypass authentication checks for development - always render the component
	// This enables navigation to all routes without login requirement
	return <Route path={path} component={Component} />;
}
