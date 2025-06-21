import { iconMap, type IconKey } from './iconMap.config';
import type { IconConfig } from './types';

export function getIconConfig(key: IconKey): IconConfig | undefined {
	return iconMap[key];
}
