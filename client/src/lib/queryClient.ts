import { QueryClient } from '@tanstack/react-query';
import type { QueryFunction } from '@tanstack/react-query';
import axios from 'axios';

// Create a custom axios instance
export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || '',
	headers: {
		'Content-Type': 'application/json'
	}
});

async function throwIfResNotOk(res: Response): Promise<void> {
	if (!res.ok) {
		const text = (await res.text()) || res.statusText;
		throw new Error(`${res.status}: ${text}`);
	}
}

export async function legacyApiRequest(
	method: string,
	url: string,
	data?: unknown | undefined
): Promise<Response> {
	const res = await fetch(url, {
		method,
		headers: data ? { 'Content-Type': 'application/json' } : {},
		body: data ? JSON.stringify(data) : undefined,
		credentials: 'include'
	});

	await throwIfResNotOk(res);
	return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
	({ on401: unauthorizedBehavior }) =>
	async ({ queryKey }) => {
		const res = await fetch(queryKey[0] as string, {
			credentials: 'include'
		});

		if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
			return null;
		}

		await throwIfResNotOk(res);
		return await res.json();
	};

// Create a new query client
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryFn: getQueryFn({ on401: 'throw' }),
			refetchInterval: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			retry: false
		},
		mutations: {
			retry: false
		}
	}
});

// Type for XP gain response
interface XpToastData {
	action: string;
	amount: number;
	description: string;
	isLevelUp?: boolean;
	newLevel?: number;
}

interface LevelUpData {
	level: number;
	title?: string;
	rewards?: unknown[];
}

interface XpGainResponse {
	xpGained?: boolean;
	xpAmount?: number;
	xpAction?: string;
	xpDescription?: string;
	levelUp?: boolean;
	newLevel?: number;
	levelTitle?: string;
	rewards?: Array<{
		type: 'badge' | 'title' | 'feature' | 'dgt';
		name: string;
		description?: string;
	}>;
}

// IMPORTANT: This is the main apiRequest function used throughout the application
/**
 * Make an API request with proper error handling
 */
export const apiRequest = async <T>(requestConfig: {
	url: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	data?: any;
	headers?: Record<string, string>;
	params?: Record<string, string>;
}): Promise<T> => {
	const { url, method = 'GET', data, headers = {}, params } = requestConfig;

	try {
		// Construct URL with query parameters if provided
		let fullUrl = url;
		if (params) {
			const queryParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value) queryParams.append(key, value);
			});
			const queryString = queryParams.toString();
			if (queryString) {
				fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
			}
		}

		const defaultHeaders = {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};

		// Construct fetch options
		const fetchOptions: RequestInit = {
			method,
			headers: {
				...defaultHeaders,
				...headers
			},
			credentials: 'include' // Include cookies for authentication
		};

		// Add request body if data is provided and method is not GET
		if (data && method !== 'GET') {
			fetchOptions.body = JSON.stringify(data);
		}

		const res = await fetch(fullUrl, fetchOptions);

		// Handle specific HTTP error codes
		if (!res.ok) {
			let errorMessage = `Request failed with status ${res.status}`;

			try {
				// Try to parse error message from response
				const errorData = await res.json();
				errorMessage = errorData.message || errorMessage;
			} catch (parseError) {
				// If we can't parse JSON, use the status text
				errorMessage = `${res.status}: ${res.statusText || 'Unknown error'}`;
			}

			// Throw a structured error
			const error = new Error(errorMessage);
			(error as any).status = res.status;
			(error as any).url = fullUrl;
			throw error;
		}

		// Check if response is empty
		const contentType = res.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const data = await res.json();

			// Check if this response contains XP gain information
			checkForXpGain(data);

			return data;
		} else {
			// For non-JSON responses (like 204 No Content)
			return {} as T;
		}
	} catch (error: unknown) {
		console.error(`API request error for ${url}:`, error);
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('Request was cancelled');
		}
		throw error;
	}
};

// Function to check for XP gain in API responses and trigger toast
function checkForXpGain(data: Record<string, unknown>) {
	// Check if the response indicates XP was gained
	if (data && data.xpGained === true) {
		// We need to get the XP toast context to show the toast
		// Since we're in a non-React context, we'll use a custom event
		const xpData: XpGainResponse = {
			xpGained: true,
			xpAmount: data.xpAmount,
			xpAction: data.xpAction,
			xpDescription: data.xpDescription,
			levelUp: data.levelUp,
			newLevel: data.newLevel,
			levelTitle: data.levelTitle,
			rewards: data.rewards
		};

		// Dispatch a custom event with the XP data
		const event = new CustomEvent('xp-gained', {
			detail: xpData
		});
		window.dispatchEvent(event);

		// If there was a level up, also trigger the level up modal
		if (data.levelUp && data.newLevel) {
			const levelUpEvent = new CustomEvent('level-up', {
				detail: {
					level: data.newLevel,
					title: data.levelTitle,
					rewards: data.rewards
				}
			});
			window.dispatchEvent(levelUpEvent);
		}
	}
}

// Listen for the XP gain event (this should be called in a React component)
export function setupXpGainListener(showXpToast: (data: XpToastData) => void) {
	const handleXpGain = (event: CustomEvent<XpGainResponse>) => {
		const { xpAmount, xpAction, xpDescription, levelUp, newLevel } = event.detail;

		if (xpAmount && xpAction && xpDescription) {
			showXpToast({
				action: xpAction,
				amount: xpAmount,
				description: xpDescription,
				isLevelUp: levelUp,
				newLevel: newLevel
			});
		}
	};

	// Add event listener
	window.addEventListener('xp-gained', handleXpGain as EventListener);

	// Return cleanup function
	return () => {
		window.removeEventListener('xp-gained', handleXpGain as EventListener);
	};
}

// Listen for level up events
export function setupLevelUpListener(
	showLevelUp: (level: number, title?: string, rewards?: unknown[]) => void
) {
	const handleLevelUp = (event: CustomEvent<LevelUpData>) => {
		const { level, title, rewards } = event.detail;
		showLevelUp(level, title, rewards);
	};

	// Add event listener
	window.addEventListener('level-up', handleLevelUp as EventListener);

	// Return cleanup function
	return () => {
		window.removeEventListener('level-up', handleLevelUp as EventListener);
	};
}
