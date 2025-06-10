import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageSquare, Users, Clock, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
	boostMultiplier = 1,
	isEventActive = false,
	eventData,
	rarity = 'common',
	className = '',
	onClick
}: ZoneCardProps) {
	// Determine the URL
	const zoneUrl = `/forums/${slug}`;
	console.log('ZoneCard generated URL:', zoneUrl);

	// Custom class based on colorTheme
	const themeClass = `zone-theme-${colorTheme}`;

	// Handle click if provided
	const handleClick = (e: React.MouseEvent) => {
		if (onClick) {
			e.preventDefault();
			onClick();
		}
	};

	// Render icon based on format (emoji or component)
	const renderIcon = () => {
		// If icon is an emoji (starts with a character that could be emoji)
		if (icon && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(icon)) {
			return <span className="text-3xl mr-2">{icon}</span>;
		}

		// If icon is not provided, use a default flame icon
		return <Flame className="h-6 w-6 mr-2" />;
	};

	// Rarity-based styles (for future implementation)
	const rarityClasses = {
		common: '',
		uncommon: 'zone-card-uncommon',
		rare: 'zone-card-rare',
		epic: 'zone-card-epic',
		legendary: 'zone-card-legendary'
	};

	return (
		<Link href={zoneUrl} onClick={handleClick}>
			<Card
				className={`
          zone-card
          ${themeClass}
          ${rarityClasses[rarity]}
          transition-all duration-200
          hover:scale-[1.03]
          border-2
          relative
          overflow-hidden
          ${className}
          ${hasXpBoost ? 'animate-pulse-glow' : ''}
        `}
			>
				{/* XP Boost Indicator */}
				{hasXpBoost && (
					<div className="absolute top-2 right-2 z-10">
						<Badge className="bg-emerald-600 text-white font-bold">{boostMultiplier}x XP</Badge>
					</div>
				)}

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

					<div className="flex flex-wrap gap-4 text-xs text-zinc-300 font-semibold">
						<div className="flex items-center bg-black/30 rounded-full px-2.5 py-1.5">
							<MessageSquare className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
							<span>{threadCount} threads</span>
						</div>

						<div className="flex items-center bg-black/30 rounded-full px-2.5 py-1.5">
							<Eye className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
							<span>{postCount} posts</span>
						</div>

						{activeUsersCount > 0 && (
							<div className="flex items-center bg-black/30 rounded-full px-2.5 py-1.5">
								<Users className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
								<span>{activeUsersCount} active</span>
							</div>
						)}
					</div>
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
