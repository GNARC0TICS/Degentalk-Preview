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
	Users,
	Folder as DefaultFolderIcon, // Renaming Folder to avoid conflict if NavNode uses 'Folder'
	ChevronRight as DefaultChevronRight,
	ChevronDown as DefaultChevronDown
} from 'lucide-react';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
// import { ZONE_THEMES } from '@/config/themeConstants';
import { buildNavigationTree, type NavNode } from '@/navigation/forumNav';
import { useForumTheme } from '@/contexts/ForumThemeProvider'; // Import the theme hook

// interface HierarchicalZoneNavProps { // Original props, keeping for reference if needed
// className?: string;
// showCounts?: boolean;
// compact?: boolean;
// }

// Simplified props as showCounts and compact were not used in the final logic
interface HierarchicalZoneNavProps {
	className?: string;
}

// Updated NavItem to use NavNode
const NavItem = ({
	node,
	isActive,
	disabled = false,
	onClick,
}: {
	node: NavNode;
	isActive?: boolean;
	disabled?: boolean;
	onClick?: () => void;
}) => {
	const { getTheme } = useForumTheme();
	const theme = getTheme(node.semanticThemeKey);

	const baseActiveClasses = `font-medium border-l-2`;
	let activeClassesConfig = theme.bgColor && theme.borderColor && theme.color ? `${theme.bgColor} ${theme.borderColor} ${theme.color}` : 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30';

	if (isActive && node.semanticThemeKey) {
		// If a specific zone-nav-theme class is needed for complex CSS, it can be added here
		// For now, direct theme properties are used.
		// activeClassesConfig = `zone-nav-theme-${node.semanticThemeKey} active ${activeClassesConfig}`;
		activeClassesConfig = `${activeClassesConfig} active`; // Ensure 'active' class is appended for global active styles
	} else if (isActive) {
		// Default active state if no specific theme key applies
		activeClassesConfig = 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30 active';
	}
	
	const activeClasses = cn(baseActiveClasses, isActive ? activeClassesConfig : '');
	const hoverClasses = `hover:bg-zinc-800/50 hover:text-white`;
	
	let displayIcon;
	if (theme.icon) {
		if (typeof theme.icon === 'string') { // Emoji or SVG path
			displayIcon = <span className={`mr-3 text-lg`} role="img" aria-hidden="true">{theme.icon}</span>;
		} else { // LucideIcon component
			const IconFromTheme = theme.icon;
			displayIcon = <IconFromTheme className={cn('w-4 h-4 mr-3', isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300')} />;
		}
	} else if (node.iconEmoji) { // Fallback to node's direct emoji if theme has no icon
		displayIcon = <span className={`mr-3 text-lg`} role="img" aria-hidden="true">{node.iconEmoji}</span>;
	} else if (node.iconComponent) { // Fallback to node's direct component
		const IconFromNode = node.iconComponent;
		displayIcon = <IconFromNode className={cn('w-4 h-4 mr-3', isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300')} />;
	} else { // Absolute fallback
		displayIcon = <DefaultFolderIcon className={cn("w-4 h-4 mr-3", isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300')} />;
	}

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
				<span className="font-medium">{node.name}</span> {/* Use node.name for children */}
			</div>
			{node.counts && ( // Use node.counts
				<div className="flex items-center gap-2">
					{node.counts.forums && node.counts.forums > 0 && (
						<Badge
							variant="outline"
							className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5"
						>
							{node.counts.forums}
						</Badge>
					)}
				</div>
			)}
		</div>
	);

	if (disabled || !node.href) { // Use node.href
		return content;
	}

	return (
		<Link href={node.href}> {/* Use node.href */}
			<a className="block">{content}</a>
		</Link>
	);
};

const GeneralCategorySection = ({ // Renamed from GeneralZoneSection to GeneralCategorySection
	categoryNode, // Changed prop name from zone to categoryNode
	isExpanded,
	onToggle,
	currentForumSlug,
	currentZoneSlug // Retaining for accurate active state calculation
}: {
	categoryNode: NavNode; // Changed type to NavNode
	isExpanded: boolean;
	onToggle: () => void;
	currentForumSlug?: string;
	currentZoneSlug?: string;
}) => {
	const { getTheme } = useForumTheme();
	const theme = getTheme(categoryNode.semanticThemeKey);

	// Determine if the category itself is active (e.g. /zones/category-slug)
	const isActiveCategory = currentZoneSlug === categoryNode.slug && !currentForumSlug;
	let activeCategorySpecificClass = theme.color || 'text-zinc-300'; // Default non-active class

	if (isActiveCategory) {
		if (categoryNode.semanticThemeKey) {
			// activeCategorySpecificClass = `zone-nav-theme-${categoryNode.semanticThemeKey} active ${theme.color}`;
			activeCategorySpecificClass = `${theme.bgColor} ${theme.borderColor} ${theme.color} active`;
		} else { // Default active style for categories without a specific theme key
			activeCategorySpecificClass = 'bg-sky-900/20 text-sky-400 border-l-2 border-sky-500/30 active';
		}
	}
	
	let CategoryIconDisplay;
	if (theme.icon) {
		if (typeof theme.icon === 'string') {
			CategoryIconDisplay = <span className="mr-3 text-lg" role="img" aria-hidden="true">{theme.icon}</span>;
		} else {
			const IconFromTheme = theme.icon;
			CategoryIconDisplay = <IconFromTheme className="w-4 h-4 mr-3 text-amber-400" />;
		}
	} else if (categoryNode.iconEmoji) {
		CategoryIconDisplay = <span className="mr-3 text-lg" role="img" aria-hidden="true">{categoryNode.iconEmoji}</span>;
	} else if (categoryNode.iconComponent) {
		const IconFromNode = categoryNode.iconComponent;
		CategoryIconDisplay = <IconFromNode className="w-4 h-4 mr-3 text-amber-400" />;
	} else {
		CategoryIconDisplay = <DefaultFolderIcon className="w-4 h-4 mr-3 text-amber-400" />;
	}

	return (
		<div className="space-y-1">
			<div
				className={cn(
					'flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-200 hover:bg-zinc-800/50 group',
					activeCategorySpecificClass
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
						<DefaultChevronDown className="w-4 h-4 mr-2 text-zinc-400 transition-transform" />
					) : (
						<DefaultChevronRight className="w-4 h-4 mr-2 text-zinc-400 transition-transform" />
					)}
					{CategoryIconDisplay}
					<span className="font-medium group-hover:text-white">{categoryNode.name}</span>
				</div>
				{categoryNode.counts?.forums && categoryNode.counts.forums > 0 && (
					<Badge variant="outline" className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5">
						<Users className="w-3 h-3 mr-0.5" />
						{categoryNode.counts.forums}
					</Badge>
				)}
			</div>

			<AnimatePresence>
				{isExpanded && categoryNode.children && categoryNode.children.length > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="ml-6 space-y-1 border-l-2 border-zinc-800/50 pl-4"
					>
						{categoryNode.children.map((forumNode: NavNode) => ( // Iterate over NavNode children
							<NavItem
								key={forumNode.id}
								node={forumNode} // Pass the full forumNode
								isActive={currentForumSlug === forumNode.slug}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export function HierarchicalZoneNav({
	className = '',
}: HierarchicalZoneNavProps) {
	const [location] = useLocation();
	const [, zonePageParams] = useRoute<{ zone_slug?: string; forum_slug?: string; thread_slug?: string }>(
		"/zones/:zone_slug/:forum_slug?/:thread_slug?" // Matches /zones/zone-slug or /zones/zone-slug/forum-slug
	);
	const [, forumPageParams] = useRoute<{ slug?: string }>("/forums/:slug"); // Matches /forums/forum-slug

	const currentZoneSlug = zonePageParams?.zone_slug;
	// If on a forum page directly (/forums/forum-slug), forumPageParams.slug will be set.
	// If on a zone's forum page (/zones/zone-slug/forum-slug), zonePageParams.forum_slug will be set.
	const currentForumSlug = zonePageParams?.forum_slug || forumPageParams?.slug;
	
	const { zones, isLoading, error } = useForumStructure();
	const navigationTree = useMemo(() => buildNavigationTree(zones), [zones]);

	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const stored = localStorage.getItem('dt-expanded-general-categories'); // Updated key
		if (stored) {
			try {
				setExpandedCategories(JSON.parse(stored));
			} catch (e) {
				console.error('Failed to parse stored expanded general categories', e);
			}
		}
		// Auto-expand current category if it's a general category and not already expanded
		const currentCategoryNode = navigationTree.find(node => node.type === 'generalCategory' && node.slug === currentZoneSlug);
		if (currentCategoryNode && !expandedCategories[currentCategoryNode.id]) {
			setExpandedCategories(prev => ({ ...prev, [currentCategoryNode.id]: true }));
		}
	}, [currentZoneSlug, navigationTree]); // Depend on navigationTree as well

	const saveToStorage = useCallback((newState: Record<string, boolean>) => {
		localStorage.setItem('dt-expanded-general-categories', JSON.stringify(newState)); // Updated key
	}, []);

	const toggleCategoryExpansion = useCallback( // Renamed from toggleGeneralZone
		(categoryId: string) => { // Changed param name
			setExpandedCategories((prev) => {
				const newState = { ...prev, [categoryId]: !prev[categoryId] };
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
	
	if (!navigationTree.length) { // Check navigationTree instead of zones
		return (
			<div className={cn("text-center p-6 bg-zinc-900/30 rounded-lg border border-zinc-800", className)}>
				<DefaultFolderIcon className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
				<p className="text-sm text-zinc-500">No forums or zones available.</p>
			</div>
		);
	}

	const systemLinkNodes = navigationTree.filter(node => node.type === 'systemLink');
	const primaryZoneNodes = navigationTree.filter(node => node.type === 'primaryZone');
	const generalCategoryNodes = navigationTree.filter(node => node.type === 'generalCategory');

	return (
		<nav className={cn('space-y-3', className)} aria-label="Forum Navigation" role="navigation">
			{systemLinkNodes.length > 0 && (
				<div className="space-y-1">
					{systemLinkNodes.map(node => (
						<NavItem
							key={node.id}
							node={node}
							isActive={location === node.href && !currentZoneSlug && !currentForumSlug}
						/>
					))}
				</div>
			)}

			{primaryZoneNodes.length > 0 && (
				<section className="space-y-2">
					<div className="px-3 py-1">
						<h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
							Primary Zones
						</h3>
					</div>
					<div className="space-y-1">
						{primaryZoneNodes.map((node) => (
							<NavItem
								key={node.id}
								node={node}
								isActive={currentZoneSlug === node.slug && !currentForumSlug}
							/>
						))}
					</div>
				</section>
			)}

			{generalCategoryNodes.length > 0 && (
				<section className="space-y-2">
					{primaryZoneNodes.length > 0 && <div className="h-px bg-zinc-800/50 my-4" />}
					<div className="px-3 py-1">
						<h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
							Categories
						</h3>
					</div>
					<div className="space-y-1">
						{generalCategoryNodes.map((categoryNode) => (
							<GeneralCategorySection // Use renamed component
								key={categoryNode.id}
								categoryNode={categoryNode} // Pass categoryNode
								isExpanded={!!expandedCategories[categoryNode.id]}
								onToggle={() => toggleCategoryExpansion(categoryNode.id)} // Use renamed toggle function
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
