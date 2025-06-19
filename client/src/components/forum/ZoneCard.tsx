import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
// Badge is no longer directly used, XpBoostBadge handles its own Badge import
import { Clock, Flame } from 'lucide-react'; // Eye, MessageSquare, Users moved to ZoneStats
import { formatDistanceToNow } from 'date-fns';
import XpBoostBadge from './XpBoostBadge'; // Import XpBoostBadge
import ZoneStats from './ZoneStats'; // Import ZoneStats

export interface ZoneCardProps {
	// Core data
	id: string | number;
	name: string;
	slug: string;
	description: string;

	// Visual customization
	icon?: string;
	colorTheme?: string;

	// Stats and metadata
	threadCount?: number;
	postCount?: number;
	activeUsersCount?: number;
	lastActivityAt?: Date;

	// Special states
	hasXpBoost?: boolean;
	boostMultiplier?: number;
	isEventActive?: boolean;
	eventData?: {
		name: string;
		endsAt: Date;
	};
	rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

	// Component behavior
	className?: string;
	onClick?: () => void;
}

/**
 * ZoneCard component - Displays a Primary Zone with custom visual styling
 * Primary Zones are single-forum, branded destinations and should be visually distinct
 * from regular category cards.
 */
export function ZoneCard({
	id,
	name,
	slug,
	description,
	icon,
	colorTheme = 'default',
	threadCount = 0,
	postCount = 0,
	activeUsersCount = 0,
	lastActivityAt,
	hasXpBoost = false,
	boostMultiplier = 1, // Default to 1 if not provided
	isEventActive = false,
	eventData,
	rarity = 'common',
	className = '',
	onClick
}: ZoneCardProps) {
	// const navigate = useNavigate(); // Removed useNavigate hook
	const zoneUrl = `/zones/${slug}`;

	const themeClass = `zone-theme-${colorTheme}`;

	// handleClick will be passed to Link's onClick.
	// If props.onClick exists, it's called. Link will navigate unless e.preventDefault() is called in props.onClick.
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (onClick) {
			onClick(); // Call the passed onClick handler
			// If the passed onClick handler calls e.preventDefault(), Link navigation will be stopped.
		}
		// No explicit navigation call here; Link component handles it.
	};

	const renderIcon = () => {
		if (icon && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(icon)) {
			return <span className="text-3xl mr-2">{icon}</span>;
		}
		return <Flame className="h-6 w-6 mr-2" />;
	};

	const rarityClasses = {
		common: '',
		uncommon: 'zone-card-uncommon',
		rare: 'zone-card-rare',
		epic: 'zone-card-epic',
		legendary: 'zone-card-legendary'
	};

	return (
		<Link
			href={zoneUrl}
			onClick={handleClick}
			data-testid="zone-card"
			className={`
          block zone-card ${themeClass} ${rarityClasses[rarity]} rounded-lg
          transition-all duration-200 hover:scale-[1.03]
          border-2 relative overflow-hidden ${className}
          ${hasXpBoost && boostMultiplier ? 'animate-pulse-glow' : ''}
        `}
		>
			<Card
				className="w-full h-full bg-transparent border-none"
			>
				{/* XP Boost Indicator */}
				<XpBoostBadge boostMultiplier={boostMultiplier} />

				{/* Event Indicator */}
				{isEventActive && eventData && (
					<div className="absolute top-0 right-0 left-0 bg-amber-600 text-xs py-1 px-2 text-center font-semibold text-white">
						{eventData.name} • Ends{' '}
						{formatDistanceToNow(new Date(eventData.endsAt), { addSuffix: true })}
					</div>
				)}

				<CardContent className={`p-6 ${isEventActive ? 'pt-8' : ''}`}>
					<div className="flex items-center mb-3">
						{renderIcon()}
						<h3 className="text-xl font-bold">{name}</h3>
					</div>

					<p className="text-sm opacity-90 mb-4">{description}</p>

					<ZoneStats
						threadCount={threadCount}
						postCount={postCount}
						activeUsersCount={activeUsersCount}
					/>
				</CardContent>

				{lastActivityAt && (
					<CardFooter className="px-6 py-3 border-t border-white/10 text-xs">
						<div className="flex items-center text-zinc-400">
							<Clock className="h-3 w-3 mr-1" />
							<span>
								Last activity {formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true })}
							</span>
						</div>
					</CardFooter>
				)}
			</Card>
		</Link>
	);
}

export default ZoneCard;
