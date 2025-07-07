import type { UserId } from '@shared/types/ids';
import React from 'react';
// Link is not used directly in CanonicalZoneGrid if ZoneCard handles its own linking.
// import { Link } from 'wouter';
import { ShopCard } from '@/components/forum/ShopCard';
import { motion } from 'framer-motion';
import { animationConfig } from '@/config/animation.config';
// Icons previously used by internal ForumZoneCard might not be needed directly here
// if ZoneCard handles its own icon rendering logic.
// import {
// 	Activity,
// 	Zap,
// 	MessageCircle,
// 	Hash,
// 	Folder
// } from 'lucide-react';
import ZoneCard, { type ZoneCardProps } from '@/components/forum/ZoneCard';

// Re-export ShopCardData for external consumers (unchanged)
export interface ShopCardData {
	id: UserId;
	type: 'shop';
	isStatic: true;
	featuredItem?: {
		name: string;
		price: number;
		image?: string;
	};
}

type Zone = ZoneCardProps['zone'];

type GridCardData = Zone | ShopCardData;

interface CanonicalZoneGridProps {
	zones: Zone[];
	className?: string;
	includeShopCard?: boolean;
	shopCardData?: ShopCardData['featuredItem'];
}

export const CanonicalZoneGrid = React.memo(function CanonicalZoneGrid({
	zones,
	className = '',
	includeShopCard = true,
	shopCardData
}: CanonicalZoneGridProps) {
	const gridData = React.useMemo<GridCardData[]>(
		() => {
			if (!zones || zones.length === 0) {
				return [];
			}
			return [
				// Spread in zone data directly – assume zones are already fully shaped for ZoneCard
				...zones,
				// Optionally append a static ShopCard entry
				...(includeShopCard
					? [
							{
								id: 'shop-card',
								type: 'shop',
								isStatic: true,
								featuredItem: shopCardData
							} as ShopCardData
						]
					: [])
			];
		},
		[zones, includeShopCard, shopCardData]
	);

	const renderedCards = React.useMemo(
		() =>
			gridData.map((cardData, index) => (
				<motion.div
					key={cardData.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						delay: index * animationConfig.stagger,
						duration: animationConfig.durations.slow,
						ease: animationConfig.easings.standard
					}}
				>
					{'type' in cardData && cardData.type === 'shop' ? (
						<ShopCard featuredItem={(cardData as ShopCardData).featuredItem} />
					) : (
						<ZoneCard zone={cardData as Zone} layout="compact" />
					)}
				</motion.div>
			)),
		[gridData]
	);

	if (!zones || zones.length === 0) {
		return (
			<div className="text-center text-zinc-400 py-12">
				<p>No primary zones available</p>
			</div>
		);
	}

	return (
		<div
			data-testid="zone-grid"
			className={`grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 ${className}`}
		>
			{renderedCards}
		</div>
	);
});

export default CanonicalZoneGrid;
