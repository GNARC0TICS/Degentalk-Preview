import React from 'react';
// Link is not used directly in CanonicalZoneGrid if ZoneCard handles its own linking.
// import { Link } from 'wouter'; 
import { ShopCard } from '@/components/forum/ShopCard';
import { motion } from 'framer-motion';
// Icons previously used by internal ForumZoneCard might not be needed directly here
// if ZoneCard handles its own icon rendering logic.
// import {
// 	Activity,
// 	Zap,
// 	MessageCircle,
// 	Hash,
// 	Folder
// } from 'lucide-react';
import type { ForumTheme } from '@/config/forumMap.config';
import { ZoneCard } from '@/components/forum/ZoneCard'; // Import external ZoneCard

export interface ZoneCardData {
	id: string | number;
	name: string;
	slug: string;
	description: string;
	icon?: string | null;
	colorTheme?: string; // Add colorTheme here
	theme?: Partial<ForumTheme>; // This can remain for other theme aspects if needed
	threadCount?: number;
	postCount?: number;
	activeUsersCount?: number;
	lastActivityAt?: Date;
	hasXpBoost?: boolean;
	boostMultiplier?: number;
	isEventActive?: boolean;
	eventData?: {
		name: string;
		endsAt: Date;
	};
}

export interface CardData extends ZoneCardData {
	type?: 'zone' | 'shop' | 'static';
	isStatic?: boolean;
}

export interface ShopCardData {
	id: string | number;
	type: 'shop';
	isStatic: true;
	featuredItem?: {
		name: string;
		price: number;
		image?: string;
	};
}

export type GridCardData = CardData | ShopCardData;

interface CanonicalZoneGridProps {
	zones: ZoneCardData[];
	className?: string;
	includeShopCard?: boolean;
	shopCardData?: ShopCardData['featuredItem'];
}

export function CanonicalZoneGrid({
	zones,
	className = '',
	includeShopCard = true,
	shopCardData
}: CanonicalZoneGridProps) {
	if (!zones || zones.length === 0) {
		return (
			<div className="text-center text-zinc-400 py-12">
				<p>No primary zones available</p>
			</div>
		);
	}

	const gridData: GridCardData[] = [
		...zones.map((zone) => ({ ...zone, type: 'zone' as const, isStatic: false })),
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

	return (
		<div data-testid="zone-grid" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 ${className}`}>
			{gridData.map((cardData, index) => (
				<motion.div
					key={cardData.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1, duration: 0.5 }}
				>
					{cardData.type === 'shop' ? (
						<ShopCard featuredItem={(cardData as ShopCardData).featuredItem} />
					) : (
						// Use the imported ZoneCard component
						<ZoneCard
							id={cardData.id}
							name={cardData.name}
							slug={cardData.slug}
							description={cardData.description}
							icon={cardData.icon === null ? undefined : cardData.icon} // Handle null icon
							colorTheme={cardData.colorTheme || 'default'} // Use the direct semantic colorTheme from cardData
							threadCount={cardData.threadCount}
							postCount={cardData.postCount}
							activeUsersCount={cardData.activeUsersCount}
							lastActivityAt={cardData.lastActivityAt}
							hasXpBoost={cardData.hasXpBoost}
							boostMultiplier={cardData.boostMultiplier}
							isEventActive={cardData.isEventActive}
							eventData={cardData.eventData}
							// rarity is not in ZoneCardData, ZoneCard will use its default
							// className can be passed if needed, or ZoneCard handles its own styling
						/>
					)}
				</motion.div>
			))}
		</div>
	);
}

// Removed internal ForumZoneCard component as it's replaced by the external ZoneCard

export default CanonicalZoneGrid;
