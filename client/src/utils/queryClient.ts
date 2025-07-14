import type { QueryFunction } from '@tanstack/react-query';

// -------------------------------------------------------------
// Canonical API helpers (shared across app)
// -------------------------------------------------------------
import {
	apiRequest as baseApiRequest,
	apiPost,
	apiPut,
	apiPatch,
	apiDelete
} from '@/utils/api-request';

export { apiPost, apiPut, apiPatch, apiDelete };

// Wrapper adds XP-gain detection but delegates actual HTTP to base implementation
export async function apiRequest<T = unknown>(
	config: import('@/utils/api-request').ApiRequestConfig
): Promise<T>;
export async function apiRequest<T = unknown>(url: string, options?: RequestInit): Promise<T>;
export async function apiRequest<T = unknown>(
	configOrUrl: import('@/utils/api-request').ApiRequestConfig | string,
	options?: RequestInit
): Promise<T> {
	const data = await baseApiRequest<T>(configOrUrl as any, options as any);
	// Reuse existing helper for XP toast if available
	try {
		(checkForXpGain as any)?.(data);
	} catch {
		/* noop */
	}
	return data;
}

async function throwIfResNotOk(res: Response) {
	if (!res.ok) {
		const text = (await res.text()) || res.statusText;
		throw new Error(`${res.status}: ${text}`);
	}
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

// Function to check for XP gain in API responses and trigger toast
function checkForXpGain(data: any) {
	// Check if the response indicates XP was gained
	if (data && data.xpGained === true) {
		// We need to get the XP toast context to show the toast
		// Since we're in a non-React context, we'll use a custom event
		const xpData = {
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

// Re-export the canonical QueryClient instance to avoid duplicate caches
export { queryClient } from '@/core/queryClient';

// Level up event listener setup
export function setupLevelUpListener(
	callback: (level: number, title?: string, rewards?: any[]) => void
) {
	const handleLevelUp = (event: CustomEvent) => {
		const { level, title, rewards } = event.detail;
		callback(level, title, rewards);
	};

	window.addEventListener('level-up', handleLevelUp as EventListener);

	// Return cleanup function
	return () => {
		window.removeEventListener('level-up', handleLevelUp as EventListener);
	};
}
