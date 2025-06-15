import { forumConfig } from '../config/forum.config';

/**
 * Retrieves a nested property from the forumConfig object via dot-notation path.
 * Example: getConfigValue<number>('xp.dailyCap')
 */
export const getConfigValue = <T = unknown>(path: string): T | undefined => {
  return path.split('.').reduce<any>((obj, key) => (obj ? obj[key] : undefined), forumConfig) as T | undefined;
};

/**
 * Deep merge helper to apply runtime overrides (e.g., DB-backed). Not used yet.
 */
export const mergeConfig = (overrides: Partial<typeof forumConfig>) => {
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
  deepMerge(forumConfig as any, overrides as any);
}; 