import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
	Folder,
	ChevronRight,
	ChevronDown,
	// Flame, // Icons will come from ZONE_THEMES
	// Target,
	// Archive,
	// Dices,
	// FileText,
	LayoutGrid,
	Users
} from 'lucide-react';
import { useForumStructure, type MergedZone, type MergedForum } from '@/contexts/ForumStructureContext';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ZONE_THEMES } from '@/config/themeConstants'; // Import ZONE_THEMES

// interface HierarchicalZoneNavProps { // Original props, keeping for reference if needed
// className?: string;
// showCounts?: boolean;
// compact?: boolean;
// }

// Simplified props as showCounts and compact were not used in the final logic
interface HierarchicalZoneNavProps {
	className?: string;
	// showCounts?: boolean; // Confirmed unused in current logic
	// compact?: boolean;  // Confirmed unused in current logic
}

const NavItem = ({
	href,
	isActive,
	icon: IconComponent,
	iconEmoji,
	semanticThemeKey,
	children,
	counts,
	disabled = false,
	onClick,
	isZoneType = false,
}: {
	href?: string;
	isActive?: boolean;
	icon?: React.ElementType;
	iconEmoji?: string | null; // Allow null
	semanticThemeKey?: string | null; // Allow null
	children: React.ReactNode;
	counts?: { forums?: number; threads?: number };
	disabled?: boolean;
	onClick?: () => void;
	isZoneType?: boolean;
}) => {
	const baseActiveClasses = `font-medium border-l-2`;
	// Default active class for non-zone types (forums within categories) or if no semanticThemeKey
	let activeClassesConfig = 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30';

	if (isActive && semanticThemeKey) {
		// This applies if it's a Zone with a theme OR a Forum with its own theme override for nav
		activeClassesConfig = `zone-nav-theme-${semanticThemeKey} active`;
	} else if (isActive) {
		// Default active state if no specific theme key applies (e.g. "All Content" or a forum without specific nav theme)
		activeClassesConfig = 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30';
	}
	
	const activeClasses = cn(baseActiveClasses, isActive ? activeClassesConfig : '');
	const hoverClasses = `hover:bg-zinc-800/50 hover:text-white`;

	const displayIcon = iconEmoji ? (
		<span className={`mr-3 text-lg`} role="img" aria-hidden="true">
			{iconEmoji}
		</span>
	) : IconComponent ? (
		<IconComponent
			className={cn(
				'w-4 h-4 mr-3',
				isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300' // Color inherited from parent if active
			)}
		/>
	) : (
		<Folder className={cn("w-4 h-4 mr-3", isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300')} />
	);

	const content = (
		<div
			className={cn(
				'flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 w-full group',
				disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
				isActive ? activeClasses : 'text-zinc-300',
				!isActive && !disabled ? hoverClasses : ''
			)}
			onClick={onClick}
		>
			<div className="flex items-center">
				{displayIcon}
				<span className="font-medium">{children}</span>
			</div>
			{counts && (
				<div className="flex items-center gap-2">
					{counts.forums && counts.forums > 0 && (
						<Badge
							variant="outline"
							className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5"
						>
							{counts.forums}
						</Badge>
					)}
				</div>
			)}
		</div>
	);

	if (disabled || !href) {
		return content;
	}

	return (
		<Link href={href}>
			<a className="block">{content}</a>
		</Link>
	);
};

const GeneralZoneSection = ({
	zone,
	isExpanded,
	onToggle,
	currentForumSlug,
	currentZoneSlug
}: {
	zone: MergedZone;
	isExpanded: boolean;
	onToggle: () => void;
	currentForumSlug?: string;
	currentZoneSlug?: string;
}) => {
	const isActiveZone = currentZoneSlug === zone.slug && !currentForumSlug;
	let activeZoneSpecificClass = 'text-zinc-300'; // Default non-active class

	if (isActiveZone) {
		if (zone.colorTheme) {
			activeZoneSpecificClass = `zone-nav-theme-${zone.colorTheme} active`;
		} else {
			activeZoneSpecificClass = 'bg-sky-900/20 text-sky-400 border-l-2 border-sky-500/30'; // Default active if no colorTheme
		}
	}
	

	const ZoneIconDisplay = zone.icon ? (
		<span className="mr-3 text-lg" role="img" aria-hidden="true">{zone.icon}</span>
	) : (
		<Folder className="w-4 h-4 mr-3 text-amber-400" />
	);

	return (
		<div className="space-y-1">
			<div
				className={cn(
					'flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-200 hover:bg-zinc-800/50 group',
					activeZoneSpecificClass
				)}
				onClick={onToggle}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onToggle();
					}
				}}
				aria-expanded={isExpanded}
			>
				<div className="flex items-center">
					{isExpanded ? (
						<ChevronDown className="w-4 h-4 mr-2 text-zinc-400 transition-transform" />
					) : (
						<ChevronRight className="w-4 h-4 mr-2 text-zinc-400 transition-transform" />
					)}
					{ZoneIconDisplay}
					<span className="font-medium group-hover:text-white">{zone.name}</span>
				</div>
				{zone.forums && zone.forums.length > 0 && (
					<Badge variant="outline" className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5">
						<Users className="w-3 h-3 mr-0.5" />
						{zone.forums.length}
					</Badge>
				)}
			</div>

			<AnimatePresence>
				{isExpanded && zone.forums && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="ml-6 space-y-1 border-l-2 border-zinc-800/50 pl-4"
					>
						{zone.forums.map((forum: MergedForum) => (
							<NavItem
								key={forum.slug}
								href={`/forums/${forum.slug}`}
								isActive={currentForumSlug === forum.slug}
								iconEmoji={forum.icon}
								semanticThemeKey={forum.colorTheme || undefined} 
								isZoneType={false} 
							>
								{forum.name}
							</NavItem>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export function HierarchicalZoneNav({
	className = '',
}: HierarchicalZoneNavProps) { // Removed unused showCounts and compact props
	const [location] = useLocation();
	const [, zonePageParams] = useRoute<{ zone_slug?: string; forum_slug?: string; thread_slug?: string }>(
		"/zones/:zone_slug/:forum_slug?/:thread_slug?"
	);
	const [, forumPageParams] = useRoute<{ slug?: string }>("/forums/:slug");

	const currentZoneSlug = zonePageParams?.zone_slug;
	const currentForumSlug = zonePageParams?.forum_slug || forumPageParams?.slug;

	const { zones, isLoading, error } = useForumStructure();

	const primaryZones = useMemo(() => zones.filter(z => z.canonical === true), [zones]);
	const generalZones = useMemo(() => zones.filter(z => z.canonical !== true && z.forums && z.forums.length > 0), [zones]);

	const [expandedGeneralZones, setExpandedGeneralZones] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const stored = localStorage.getItem('dt-expanded-general-zones');
		if (stored) {
			try {
				setExpandedGeneralZones(JSON.parse(stored));
			} catch (e) {
				console.error('Failed to parse stored expanded general zones', e);
			}
		}
		if (currentZoneSlug && generalZones.some(z => z.slug === currentZoneSlug) && !expandedGeneralZones[currentZoneSlug]) {
			setExpandedGeneralZones(prev => ({ ...prev, [currentZoneSlug]: true }));
		}
	}, [currentZoneSlug, generalZones]);

	const saveToStorage = useCallback((newState: Record<string, boolean>) => {
		localStorage.setItem('dt-expanded-general-zones', JSON.stringify(newState));
	}, []);

	const toggleGeneralZone = useCallback(
		(zoneSlug: string) => {
			setExpandedGeneralZones((prev) => {
				const newState = { ...prev, [zoneSlug]: !prev[zoneSlug] };
				saveToStorage(newState);
				return newState;
			});
		},
		[saveToStorage]
	);

	if (isLoading) {
		return (
			<div className={cn("p-4 space-y-2", className)}>
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className={cn("p-4 text-red-400 text-sm", className)}>
				Error loading navigation: {(error as Error).message}
			</div>
		);
	}
	
	if (!zones.length) {
		return (
			<div className={cn("text-center p-6 bg-zinc-900/30 rounded-lg border border-zinc-800", className)}>
				<Folder className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
				<p className="text-sm text-zinc-500">No forums or zones available.</p>
			</div>
		);
	}

	return (
		<nav className={cn('space-y-3', className)} aria-label="Forum Navigation" role="navigation">
			<div className="space-y-1">
				<NavItem
					href="/forums"
					isActive={location === '/forums' && !currentZoneSlug && !currentForumSlug}
					icon={LayoutGrid}
				>
					All Content
				</NavItem>
			</div>

			{primaryZones.length > 0 && (
				<section className="space-y-2">
					<div className="px-3 py-1">
						<h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
							Primary Zones
						</h3>
					</div>
					<div className="space-y-1">
						{primaryZones.map((zone) => (
							<NavItem
								key={zone.slug}
								href={`/zones/${zone.slug}`}
								isActive={currentZoneSlug === zone.slug && !currentForumSlug}
								iconEmoji={zone.icon}
								semanticThemeKey={zone.colorTheme || 'default'}
								isZoneType={true}
							>
								{zone.name}
							</NavItem>
						))}
					</div>
				</section>
			)}

			{generalZones.length > 0 && (
				<section className="space-y-2">
					{primaryZones.length > 0 && <div className="h-px bg-zinc-800/50 my-4" />}
					<div className="px-3 py-1">
						<h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
							Categories
						</h3>
					</div>
					<div className="space-y-1">
						{generalZones.map((zone) => (
							<GeneralZoneSection
								key={zone.slug}
								zone={zone}
								isExpanded={!!expandedGeneralZones[zone.slug]}
								onToggle={() => toggleGeneralZone(zone.slug)}
								currentForumSlug={currentForumSlug}
								currentZoneSlug={currentZoneSlug}
							/>
						))}
					</div>
				</section>
			)}
		</nav>
	);
}

export { HierarchicalZoneNav as HierarchicalForumNav };
export default HierarchicalZoneNav;
