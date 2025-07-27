import { useCallback, useEffect, useState } from 'react';
import {
	setAuthToken,
	getAuthToken,
	removeAuthToken,
	hasAuthToken,
	isTokenExpired,
	decodeToken
} from '@/utils/auth-token';

interface UseAuthTokenReturn {
	token: string | null;
	hasToken: boolean;
	isExpired: boolean;
	setToken: (token: string) => void;
	clearToken: () => void;
	tokenData: any | null;
}

/**
 * Hook for managing JWT authentication tokens
 */
export function useAuthToken(): UseAuthTokenReturn {
	const [token, setTokenState] = useState<string | null>(getAuthToken());

	// Check for token changes from other tabs/windows
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'degentalk_auth_token') {
				setTokenState(e.newValue);
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	const setToken = useCallback((newToken: string) => {
		setAuthToken(newToken);
		setTokenState(newToken);
	}, []);

	const clearToken = useCallback(() => {
		removeAuthToken();
		setTokenState(null);
	}, []);

	const hasToken = hasAuthToken();
	const isExpired = isTokenExpired(token || undefined);
	const tokenData = token ? decodeToken(token) : null;

	// Auto-clear expired tokens
	useEffect(() => {
		if (token && isExpired) {
			clearToken();
		}
	}, [token, isExpired, clearToken]);

	return {
		token,
		hasToken,
		isExpired,
		setToken,
		clearToken,
		tokenData
	};
}