import { rarityColorMap, rarityBorderMap } from '@/config/rarity.config';

export function getRarityColor(rarity?: string): string {
	const key = rarity?.toLowerCase() as keyof typeof rarityColorMap | undefined;
	return key ? rarityColorMap[key] : rarityColorMap.common;
}

export function getRarityBorderClass(rarity?: string): string {
	const key = rarity?.toLowerCase() as keyof typeof rarityBorderMap | undefined;
	return key ? rarityBorderMap[key] : rarityBorderMap.common;
}
