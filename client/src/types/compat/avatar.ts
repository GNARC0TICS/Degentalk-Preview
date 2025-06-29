// No canonical AvatarFrame yet; define minimal shape here.

// Minimal AvatarFrame interface replicating schema for frontend usage
export interface AvatarFrame {
	id: number;
	name: string;
	imageUrl: string;
	rarity?: string;
	animated?: boolean;
}

// Until a canonical type is defined, alias to local interface
export type { AvatarFrame as AvatarFrameCompat };
