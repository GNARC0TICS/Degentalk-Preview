import { iconMap, type IconKey } from './iconMap.config.ts';
import type { IconConfig } from './types.ts';

export function getIconConfig(key: IconKey): IconConfig | undefined {
	return iconMap[key];
}
