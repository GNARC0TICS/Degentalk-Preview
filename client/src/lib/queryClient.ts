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
} from '@/lib/api-request';

export { apiPost, apiPut, apiPatch, apiDelete };

// Wrapper adds XP-gain detection but delegates actual HTTP to base implementation
export const apiRequest = async <T>(config: Parameters<typeof baseApiRequest>[0]): Promise<T> => {
	const data = await baseApiRequest<T>(config);
	// Reuse existing helper for XP toast if available
	try {
		(checkForXpGain as any)?.(data);
	} catch {
		/* noop */
	}
	return data;
};

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

// Type for XP gain response
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

// Function to check for XP gain in API responses and trigger toast
function checkForXpGain(data: any) {
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
export function setupXpGainListener(showXpToast: Function) {
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
export function setupLevelUpListener(showLevelUp: Function) {
	const handleLevelUp = (
		event: CustomEvent<{
			level: number;
			title?: string;
			rewards?: any[];
		}>
	) => {
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

// Re-export the canonical QueryClient instance to avoid duplicate caches
export { queryClient } from '@/core/queryClient';
