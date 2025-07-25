import type { UserId } from '@shared/types/ids';
import React from 'react';
// Link is not used directly in FeaturedForumGrid if FeaturedForumCard handles its own linking.
// import { Link } from 'react-router-dom';
import { ShopCard } from '@app/components/forum/ShopCard';
import { motion } from 'framer-motion';
import { animationConfig } from '@app/config/animation.config';
// Icons previously used by internal ForumFeaturedForumCard might not be needed directly here
// if FeaturedForumCard handles its own icon rendering logic.
// import {
// 	Activity,
// 	Zap,
// 	MessageCircle,
// 	Hash,
// 	Folder
// } from 'lucide-react';
import FeaturedForumCard, { type FeaturedForumCardProps } from '@app/components/forum/FeaturedForumCard';

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

type Forum = FeaturedForumCardProps['forum'];

type GridCardData = Forum | ShopCardData;

interface FeaturedForumGridProps {
	forums: Forum[];
	className?: string;
	includeShopCard?: boolean;
	shopCardData?: ShopCardData['featuredItem'];
}

export const FeaturedForumGrid = React.memo(function FeaturedForumGrid({
	forums,
	className = '',
	includeShopCard = true,
	shopCardData
}: FeaturedForumGridProps) {
	const gridData = React.useMemo<GridCardData[]>(() => {
		if (!forums || forums.length === 0) {
			return [];
		}
		return [
			// Spread in forum data directly – assume forums are already fully shaped for FeaturedForumCard
			...forums,
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
	}, [forums, includeShopCard, shopCardData]);

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
						<FeaturedForumCard forum={cardData as Forum} layout="compact" />
					)}
				</motion.div>
			)),
		[gridData]
	);

	if (!forums || forums.length === 0) {
		return (
			<div className="text-center text-zinc-400 py-12">
				<p>No primary forums available</p>
			</div>
		);
	}

	return (
		<div
			data-testid="forum-grid"
			className={`grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 ${className}`}
		>
			{renderedCards}
		</div>
	);
});

export default FeaturedForumGrid;
