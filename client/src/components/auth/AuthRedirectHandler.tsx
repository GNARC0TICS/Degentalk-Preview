import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@app/hooks/use-auth';

/**
 * Component that handles auth-related redirects
 * This must be rendered inside a Router context
 */
export function AuthRedirectHandler() {
	const { shouldRedirectToAuth, clearAuthRedirect } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (shouldRedirectToAuth) {
			navigate('/auth');
			clearAuthRedirect();
		}
	}, [shouldRedirectToAuth, navigate, clearAuthRedirect]);

	return null;
}