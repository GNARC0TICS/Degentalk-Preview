import { featureFlags } from '@/config/featureFlags';

/**
 * Hook to determine if the "HOT" ribbon should be shown
 * Centralizes the feature flag logic for hot ribbon display
 */
export const useShowHotRibbon = (): boolean => {
	return featureFlags?.forum?.showHotRibbon ?? true;
};
