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
import ZoneCard from '@/components/forum/ZoneCard';

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
	forumCount?: number;
	forums?: Array<{
		id: number;
		slug: string;
		name: string;
		description?: string | null;
		threadCount: number;
		postCount: number;
	}>;
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
		...zones.map((zone) => {
			// Calculate total forums including subforums
			const directForums = zone.forums ? zone.forums.length : 0;
			const subForums = zone.forums
				? zone.forums.reduce((sum, f) => sum + (f.subforums ? f.subforums.length : 0), 0)
				: 0;
			const forumCount = directForums + subForums;
			return { ...zone, forumCount, type: 'zone' as const, isStatic: false };
		}),
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
		<div
			data-testid="zone-grid"
			className={`grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 ${className}`}
		>
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
							zone={{
								id: String(cardData.id),
								name: cardData.name,
								slug: cardData.slug,
								description: cardData.description,
								icon: cardData.icon ?? undefined,
								colorTheme: cardData.colorTheme || 'default',
								stats: {
									activeUsers: cardData.activeUsersCount ?? 0,
									totalThreads: cardData.threadCount ?? 0,
									totalPosts: cardData.postCount ?? 0,
									todaysPosts: 0
								},
								features: {
									hasXpBoost: cardData.hasXpBoost,
									boostMultiplier: cardData.boostMultiplier,
									isEventActive: cardData.isEventActive,
									isPremium: false
								},
								activity: cardData.lastActivityAt
									? {
											trendingThreads: 0,
											momentum: 'stable',
											lastActiveUser: undefined
										}
									: undefined,
								forums: cardData.forums?.map((f) => ({
									id: String(f.id),
									name: f.name,
									threadCount: f.threadCount,
									isPopular: f.threadCount > 100
								}))
							}}
							layout="compact"
							showPreview={true}
						/>
					)}
				</motion.div>
			))}
		</div>
	);
}

// Removed internal ForumZoneCard component as it's replaced by the external ZoneCard

export default CanonicalZoneGrid;
