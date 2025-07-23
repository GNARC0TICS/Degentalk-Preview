import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

/**
 * Hook for auth-related navigation that safely handles Router context
 * This separates navigation concerns from the auth provider
 */
export function useAuthNavigation() {
	const navigate = useNavigate();
	const pendingNavigation = useRef<string | null>(null);

	// Handle any pending navigation after Router is ready
	useEffect(() => {
		if (pendingNavigation.current) {
			navigate(pendingNavigation.current);
			pendingNavigation.current = null;
		}
	}, [navigate]);

	const navigateToAuth = () => {
		navigate('/auth');
	};

	const navigateToHome = () => {
		navigate('/');
	};

	return {
		navigateToAuth,
		navigateToHome,
		navigate
	};
}

/**
 * Component that handles auth navigation side effects
 * This should be rendered inside the Router but outside the auth-dependent components
 */
export function AuthNavigationHandler({ shouldNavigateToAuth }: { shouldNavigateToAuth: boolean }) {
	const { navigateToAuth } = useAuthNavigation();

	useEffect(() => {
		if (shouldNavigateToAuth) {
			navigateToAuth();
		}
	}, [shouldNavigateToAuth, navigateToAuth]);

	return null;
}