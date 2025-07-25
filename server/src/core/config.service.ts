import { forumEconomyConfig } from '@config/forumEconomy';

/**
 * Retrieves a nested property from the forumConfig object via dot-notation path.
 * Example: getConfigValue<number>('xp.dailyCap')
 */
export const getConfigValue = <T = unknown>(path: string): T | undefined => {
	return path.split('.').reduce<any>((obj, key) => (obj ? obj[key] : undefined), forumEconomyConfig) as
		| T
		| undefined;
};

/**
 * Deep merge helper to apply runtime overrides (e.g., DB-backed). Not used yet.
 */
export const mergeConfig = (overrides: Partial<typeof forumEconomyConfig>) => {
	const deepMerge = (target: any, source: any) => {
		for (const k of Object.keys(source)) {
			if (source[k] && typeof source[k] === 'object') {
				if (!target[k]) target[k] = {};
				deepMerge(target[k], source[k]);
			} else {
				target[k] = source[k];
			}
		}
	};
	deepMerge(forumEconomyConfig as any, overrides as any);
};
