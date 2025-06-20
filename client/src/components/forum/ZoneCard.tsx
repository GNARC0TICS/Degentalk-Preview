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
	themeColor?: string; // Actual hex color for dynamic styling

	// Stats and metadata
	forumCount?: number;
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
	layout?: 'vertical' | 'horizontal';
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
	themeColor,
	forumCount = 0,
	threadCount = 0,
	activeUsersCount = 0,
	lastActivityAt,
	hasXpBoost = false,
	boostMultiplier = 1, // Default to 1 if not provided
	isEventActive = false,
	eventData,
	rarity = 'common',
	className = '',
	onClick,
	layout = 'vertical'
}: ZoneCardProps) {
	// const navigate = useNavigate(); // Removed useNavigate hook
	const zoneUrl = `/zones/${slug}`;

	const themeClass = `zone-theme-${colorTheme}`;

	// Generate dynamic styles based on themeColor
	const getDynamicStyles = (): React.CSSProperties => {
		if (!themeColor || themeColor === 'holographic') {
			return {};
		}

		return {
			'--zone-color': themeColor,
			'--zone-glow': `${themeColor}40`, // 25% opacity
			'--zone-border': `${themeColor}60`, // 37.5% opacity
			'--zone-gradient': `linear-gradient(135deg, ${themeColor}15 0%, transparent 50%, ${themeColor}08 100%)`
		} as React.CSSProperties;
	};

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
			style={getDynamicStyles()}
			className={`
          block zone-card ${themeClass} ${rarityClasses[rarity]} rounded-lg
          transition-all duration-200 hover:scale-[1.03]
          border-2 relative overflow-hidden ${className}
          ${hasXpBoost && boostMultiplier ? 'animate-pulse-glow' : ''}
          ${themeColor && themeColor !== 'holographic' ? 'zone-card-themed' : ''}
        `}
		>
			<Card className="w-full h-full bg-transparent border-none">
				{/* XP Boost Indicator */}
				<XpBoostBadge boostMultiplier={boostMultiplier} />

				{/* Event Indicator */}
				{isEventActive && eventData && (
					<div className="absolute top-0 right-0 left-0 bg-amber-600 text-xs py-1 px-2 text-center font-semibold text-white">
						{eventData.name} • Ends{' '}
						{formatDistanceToNow(new Date(eventData.endsAt), { addSuffix: true })}
					</div>
				)}

				<CardContent
					className={`p-6 ${isEventActive ? 'pt-8' : ''} ${
						layout === 'horizontal' ? 'md:flex md:items-start md:gap-6' : ''
					}`}
				>
					{/* Icon and title */}
					<div className="flex items-center mb-3 flex-shrink-0">
						{renderIcon()}
						<h3 className="text-xl font-bold">{name}</h3>
					</div>

					{/* description and stats wrap */}
					<div className={layout === 'horizontal' ? 'flex-1' : ''}>
						<p className="text-sm opacity-90 mb-4">{description}</p>

						<ZoneStats
							forumCount={forumCount}
							threadCount={threadCount}
							activeUsersCount={activeUsersCount}
						/>
					</div>
				</CardContent>

				{lastActivityAt && (
					<CardFooter
						className="px-6 py-3 border-t border-white/10 text-xs relative"
						style={
							themeColor && themeColor !== 'holographic'
								? {
										backgroundImage: `var(--zone-gradient)`
									}
								: {}
						}
					>
						<div className="flex items-center text-zinc-400 relative z-10">
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
