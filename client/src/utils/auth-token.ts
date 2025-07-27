import { logger } from '@/lib/logger';

/**
 * JWT Token Management Utilities
 * Handles storage and retrieval of authentication tokens
 */

const TOKEN_KEY = 'degentalk_auth_token';

/**
 * Store JWT token in localStorage
 */
export function setAuthToken(token: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(TOKEN_KEY, token);
	}
}

/**
 * Get JWT token from localStorage
 */
export function getAuthToken(): string | null {
	if (typeof window !== 'undefined') {
		return localStorage.getItem(TOKEN_KEY);
	}
	return null;
}

/**
 * Remove JWT token from localStorage
 */
export function removeAuthToken(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(TOKEN_KEY);
	}
}

/**
 * Check if user has a valid token
 */
export function hasAuthToken(): boolean {
	return !!getAuthToken();
}

/**
 * Get authorization header value
 */
export function getAuthHeader(): { Authorization: string } | {} {
	const token = getAuthToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Decode JWT token payload (without verification)
 * Note: This is for client-side use only, never trust this for security
 */
export function decodeToken(token?: string): any | null {
	const actualToken = token || getAuthToken();
	if (!actualToken) return null;

	try {
		const base64Url = actualToken.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		logger.error('AuthToken', 'Failed to decode token:', error);
		return null;
	}
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token?: string): boolean {
	const decoded = decodeToken(token);
	if (!decoded || !decoded.exp) return true;

	const currentTime = Date.now() / 1000;
	return decoded.exp < currentTime;
}

/**
 * Get time until token expires in milliseconds
 * Returns null if no token or no expiration
 */
export function getTokenExpirationTime(): number | null {
	const decoded = decodeToken();
	if (!decoded || !decoded.exp) return null;

	const currentTime = Date.now();
	const expirationTime = decoded.exp * 1000;
	return expirationTime - currentTime;
}

/**
 * Check if token will expire within a given time window
 * @param windowMs Time window in milliseconds (default: 5 minutes)
 */
export function isTokenExpiringSoon(windowMs: number = 5 * 60 * 1000): boolean {
	const timeUntilExpiry = getTokenExpirationTime();
	if (timeUntilExpiry === null) return true; // No token or no exp
	return timeUntilExpiry < windowMs;
}

/**
 * Auto-include token in fetch requests
 * Automatically removes expired tokens
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
	let token = getAuthToken();
	
	// Remove expired token before making request
	if (token && isTokenExpired()) {
		removeAuthToken();
		token = null;
	}
	
	const headers = {
		...options.headers,
		...(token ? { Authorization: `Bearer ${token}` } : {})
	};

	return fetch(url, {
		...options,
		headers
	});
}