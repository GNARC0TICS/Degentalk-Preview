// No canonical AvatarFrame yet; define minimal shape here.

import type { UserId } from '@db/types';

// Minimal AvatarFrame interface replicating schema for frontend usage
export interface AvatarFrame {
	id: UserId;
	name: string;
	imageUrl: string;
	rarity?: string;
	animated?: boolean;
}

// Until a canonical type is defined, alias to local interface
export type { AvatarFrame as AvatarFrameCompat };
