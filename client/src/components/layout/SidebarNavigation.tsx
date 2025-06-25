import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
	Folder as DefaultFolderIcon,
	MessageSquare,
	ChevronDown,
	ChevronRight,
	LayoutGrid
} from 'lucide-react';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import { buildNavigationTree, type NavNode } from '@/navigation/forumNav';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // For potential count display
import { motion, AnimatePresence } from 'framer-motion';

// interface PinnedItem extends ForumEntityBase { // Commenting out PinnedItem for now
// 	type: 'zone' | 'category' | 'forum';
// }

interface SidebarNavigationProps {
	className?: string;
	isCollapsed?: boolean;
	// userPinnedItems?: PinnedItem[]; // Commenting out PinnedItem for now
}

const SidebarNavItem = ({
	node,
	isActive,
	onClick,
	disabled = false,
	isCollapsed = false
}: {
	node: NavNode;
	isActive?: boolean;
	onClick?: () => void;
	disabled?: boolean;
	isCollapsed?: boolean;
}) => {
	const baseActiveClasses = `font-medium`; // Simplified active style for this sidebar
	let activeClassesConfig = '';

	if (isActive && node.semanticThemeKey) {
		activeClassesConfig = `zone-nav-theme-${node.semanticThemeKey} active text-white`; // Example active style
	} else if (isActive) {
		activeClassesConfig = 'bg-zinc-700 text-emerald-400'; // Default active
	}

	const activeClasses = cn(baseActiveClasses, isActive ? activeClassesConfig : '');
	const hoverClasses = `hover:bg-zinc-800/50 hover:text-white`;
	const IconComponent = node.iconComponent;

	const displayIcon = node.iconEmoji ? (
		<span className={`mr-2 text-md`} role="img" aria-hidden="true">
			{' '}
			{/* Adjusted margin/size */}
			{node.iconEmoji}
		</span>
	) : IconComponent ? (
		<IconComponent
			className={cn(
				'w-3.5 h-3.5 mr-2', // Adjusted size
				isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300'
			)}
		/>
	) : (
		<DefaultFolderIcon
			className={cn('w-3.5 h-3.5 mr-2', isActive ? '' : 'text-zinc-400 group-hover:text-zinc-300')}
		/>
	);

	const content = (
		<div
			className={cn(
				'flex items-center text-sm rounded-md transition-all duration-150 w-full group',
				isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-1.5', // Adjusted padding
				disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
				isActive ? activeClasses : 'text-zinc-300',
				!isActive && !disabled ? hoverClasses : ''
			)}
			onClick={onClick}
			title={isCollapsed ? node.name : undefined} // Show tooltip when collapsed
		>
			{displayIcon}
			{/* Hide text when collapsed */}
			{!isCollapsed && <span className="flex-1">{node.name}</span>}
			{/* Optional: Add counts if needed, e.g., node.counts?.threads */}
		</div>
	);

	if (disabled || !node.href) {
		return content;
	}

	return (
		<Link href={node.href}>
			<a className="block">{content}</a>
		</Link>
	);
};

const SidebarCategorySection = ({
	categoryNode,
	isExpanded,
	onToggle,
	currentPath,
	isCollapsed = false
}: {
	categoryNode: NavNode;
	isExpanded: boolean;
	onToggle: () => void;
	currentPath: string;
	isCollapsed?: boolean;
}) => {
	const isActiveCategory =
		currentPath === categoryNode.href || currentPath.startsWith(`${categoryNode.href}/`);
	let activeCategorySpecificClass = '';

	if (isActiveCategory && categoryNode.type !== 'forum') {
		// Only apply direct active style if it's the category itself
		if (categoryNode.semanticThemeKey) {
			activeCategorySpecificClass = `zone-nav-theme-${categoryNode.semanticThemeKey} active text-white font-medium`;
		} else {
			activeCategorySpecificClass = 'bg-zinc-700 text-emerald-400 font-medium';
		}
	}

	const CategoryIconComponent = categoryNode.iconComponent;
	const CategoryIconDisplay = categoryNode.iconEmoji ? (
		<span className="mr-2 text-md" role="img" aria-hidden="true">
			{categoryNode.iconEmoji}
		</span>
	) : CategoryIconComponent ? (
		<CategoryIconComponent className="w-3.5 h-3.5 mr-2 text-zinc-400" />
	) : (
		<DefaultFolderIcon className="w-3.5 h-3.5 mr-2 text-zinc-400" />
	);

	return (
		<div>
			<div
				className={cn(
					'flex items-center text-sm rounded-md cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 group',
					isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-3 py-1.5',
					// Apply activeCategorySpecificClass if it's set (meaning category itself is active or themed)
					// Otherwise, default to text-zinc-300 if not active in any way.
					(isActiveCategory && categoryNode.children.length === 0) ||
						(isActiveCategory && categoryNode.type !== 'forum')
						? activeCategorySpecificClass
						: categoryNode.children.length > 0 && isActiveCategory
							? 'font-medium text-emerald-400'
							: 'text-zinc-300'
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
				title={isCollapsed ? categoryNode.name : undefined} // Show tooltip when collapsed
			>
				<div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'flex-1')}>
					{/* Hide chevron when collapsed */}
					{!isCollapsed &&
						categoryNode.children.length > 0 &&
						(isExpanded ? (
							<ChevronDown className="w-3.5 h-3.5 mr-1.5 text-zinc-400 transition-transform" />
						) : (
							<ChevronRight className="w-3.5 h-3.5 mr-1.5 text-zinc-400 transition-transform" />
						))}
					{CategoryIconDisplay}
					{/* Hide text when collapsed */}
					{!isCollapsed && <span className="group-hover:text-white">{categoryNode.name}</span>}
				</div>
				{/* Optional: Badge for forum count */}
				{/* {categoryNode.counts?.forums && categoryNode.counts.forums > 0 && (
					<Badge variant="secondary" className="text-xs">{categoryNode.counts.forums}</Badge>
				)} */}
			</div>

			{/* Don't show expanded content when collapsed */}
			<AnimatePresence>
				{!isCollapsed &&
					isExpanded &&
					categoryNode.children &&
					categoryNode.children.length > 0 && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
							className="ml-4 pl-3 mt-1 space-y-0.5 border-l border-zinc-700" // Adjusted spacing
						>
							{categoryNode.children.map((forumNode: NavNode) => (
								<SidebarNavItem
									key={forumNode.id}
									node={forumNode}
									isActive={
										currentPath === forumNode.href || currentPath.startsWith(`${forumNode.href}/`)
									}
									isCollapsed={isCollapsed}
								/>
							))}
						</motion.div>
					)}
			</AnimatePresence>
		</div>
	);
};

export function SidebarNavigation({
	className = '',
	isCollapsed = false
	// userPinnedItems = [] // Commenting out for now
}: SidebarNavigationProps) {
	const [location] = useLocation();
	const { zones, isLoading, error: forumStructureError } = useForumStructure();

	const navigationTree = useMemo(() => {
		if (isLoading || forumStructureError || !zones) return [];
		return buildNavigationTree(zones);
	}, [zones, isLoading, forumStructureError]);

	const [expandedCategories, setExpandedCategories] = useLocalStorage<Record<string, boolean>>(
		'dt-sidebar-expanded-categories',
		{}
	);

	// Auto-expand category of active child forum or if category itself is active
	useEffect(() => {
		const activeNode = navigationTree.find(
			(node) => location === node.href || location.startsWith(`${node.href}/`)
		);

		if (activeNode) {
			// If active node is a forum, find its parent category
			const parentCategory =
				activeNode.type === 'forum'
					? navigationTree.find(
							(cat) =>
								cat.type === 'generalCategory' &&
								cat.children.some((child) => child.id === activeNode.id)
						)
					: activeNode.type === 'generalCategory'
						? activeNode
						: undefined;

			if (parentCategory && !expandedCategories[parentCategory.id]) {
				setExpandedCategories((prev) => ({ ...prev, [parentCategory.id]: true }));
			}
		}
	}, [location, navigationTree, expandedCategories, setExpandedCategories]);

	const toggleCategoryExpansion = useCallback(
		(categoryId: string) => {
			setExpandedCategories((prev) => ({
				...prev,
				[categoryId]: !prev[categoryId]
			}));
		},
		[setExpandedCategories]
	);

	if (isLoading)
		return <div className={cn('p-3 text-sm text-zinc-400', className)}>Loading navigation...</div>;
	if (forumStructureError)
		return (
			<div className={cn('p-3 text-sm text-red-400', className)}>Error loading navigation.</div>
		);
	if (!navigationTree.length)
		return <div className={cn('p-3 text-sm text-zinc-500', className)}>No navigation items.</div>;

	const systemLinkNodes = navigationTree.filter((node) => node.type === 'systemLink');
	const primaryZoneNodes = navigationTree.filter((node) => node.type === 'primaryZone');
	const generalCategoryNodes = navigationTree.filter((node) => node.type === 'generalCategory');

	return (
		<nav className={cn('space-y-4', className)}>
			{' '}
			{/* Adjusted main spacing */}
			{/* Pinned Items Section (Placeholder) */}
			{/* {userPinnedItems.length > 0 && ( ...pinned items logic... )} */}
			{systemLinkNodes.length > 0 && (
				<div>
					{/* Optional: Header for system links */}
					{/* <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-zinc-500">Navigation</div> */}
					<div className="space-y-0.5 mt-1">
						{' '}
						{/* Adjusted spacing */}
						{systemLinkNodes.map((node) => (
							<SidebarNavItem
								key={node.id}
								node={node}
								isActive={location === node.href}
								isCollapsed={isCollapsed}
							/>
						))}
					</div>
				</div>
			)}
			{primaryZoneNodes.length > 0 && (
				<div>
					{/* Hide section headers when collapsed */}
					{!isCollapsed && (
						<div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-zinc-500">
							Primary Zones
						</div>
					)}
					<div className="space-y-0.5 mt-1">
						{' '}
						{/* Adjusted spacing */}
						{primaryZoneNodes.map((node) => (
							<SidebarNavItem
								key={node.id}
								node={node}
								isActive={location === node.href || location.startsWith(`${node.href}/`)}
								isCollapsed={isCollapsed}
							/>
						))}
					</div>
				</div>
			)}
			{/* Hide divider when collapsed */}
			{!isCollapsed &&
				(systemLinkNodes.length > 0 || primaryZoneNodes.length > 0) &&
				generalCategoryNodes.length > 0 && (
					<div className="h-px bg-zinc-700/60 mx-2 my-3" /> // Adjusted divider
				)}
			{generalCategoryNodes.length > 0 && (
				<div>
					{/* Hide section headers when collapsed */}
					{!isCollapsed && (
						<div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-zinc-500">
							Categories
						</div>
					)}
					<div className="space-y-0.5 mt-1">
						{' '}
						{/* Adjusted spacing */}
						{generalCategoryNodes.map((categoryNode) => (
							<SidebarCategorySection
								key={categoryNode.id}
								categoryNode={categoryNode}
								isExpanded={!!expandedCategories[categoryNode.id]}
								onToggle={() => toggleCategoryExpansion(categoryNode.id)}
								currentPath={location}
								isCollapsed={isCollapsed}
							/>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}

export default SidebarNavigation;
