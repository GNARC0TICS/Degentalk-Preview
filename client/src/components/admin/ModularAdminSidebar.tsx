/**
 * Modular Admin Sidebar Component
 *
 * A fully permission-aware, collapsible sidebar that integrates with the
 * AdminModuleRegistry for dynamic navigation generation.
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import {
	ExternalLink,
	ChevronDown,
	ChevronUp,
	Menu,
	X,
	Settings,
	Shield,
	AlertCircle,
	CheckCircle,
	Clock,
	Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdminNavigation } from '@/hooks/use-admin-modules';
import { useAuth } from '@/hooks/use-auth';
import type { AdminModule } from '@shared/config/admin.config';

// Icon mapping for module icons
const iconMap: Record<string, any> = {
	Settings,
	Shield,
	Users: () => (
		<div className="w-4 h-4 rounded bg-blue-500 text-white text-xs flex items-center justify-center">
			U
		</div>
	),
	TrendingUp: () => (
		<div className="w-4 h-4 rounded bg-green-500 text-white text-xs flex items-center justify-center">
			↗
		</div>
	),
	Wallet: () => (
		<div className="w-4 h-4 rounded bg-yellow-500 text-white text-xs flex items-center justify-center">
			W
		</div>
	),
	ShoppingBag: () => (
		<div className="w-4 h-4 rounded bg-purple-500 text-white text-xs flex items-center justify-center">
			S
		</div>
	),
	BarChart3: () => (
		<div className="w-4 h-4 rounded bg-blue-600 text-white text-xs flex items-center justify-center">
			📊
		</div>
	),
	Megaphone: () => (
		<div className="w-4 h-4 rounded bg-orange-500 text-white text-xs flex items-center justify-center">
			📢
		</div>
	),
	Package: () => (
		<div className="w-4 h-4 rounded bg-indigo-500 text-white text-xs flex items-center justify-center">
			📦
		</div>
	),
	ToggleLeft: () => (
		<div className="w-4 h-4 rounded bg-gray-500 text-white text-xs flex items-center justify-center">
			⚙
		</div>
	),
	Landmark: () => (
		<div className="w-4 h-4 rounded bg-emerald-600 text-white text-xs flex items-center justify-center">
			🏛
		</div>
	),
	// Add fallback
	default: () => (
		<div className="w-4 h-4 rounded bg-gray-400 text-white text-xs flex items-center justify-center">
			•
		</div>
	)
};

// Get icon component from icon name
const getIconComponent = (iconName: string): React.ComponentType => {
	return iconMap[iconName] || iconMap.default;
};

// Module status badge configurations
const getModuleStatus = (module: AdminModule) => {
	if (!module.enabled) {
		return {
			icon: AlertCircle,
			color: 'text-red-500',
			badge: 'error',
			tooltip: 'Module disabled'
		};
	}

	// Check if module has settings that might indicate status
	if (module.settings?.maintenance) {
		return {
			icon: Clock,
			color: 'text-yellow-500',
			badge: 'warning',
			tooltip: 'Under maintenance'
		};
	}

	if (module.settings?.beta) {
		return {
			icon: Zap,
			color: 'text-blue-500',
			badge: 'beta',
			tooltip: 'Beta feature'
		};
	}

	return {
		icon: CheckCircle,
		color: 'text-green-500',
		badge: 'active',
		tooltip: 'Active'
	};
};

interface ModularAdminSidebarProps {
	collapsed: boolean;
	onToggleCollapsed: () => void;
	onLinkClick?: () => void;
	showStatusIndicators?: boolean;
	className?: string;
}

export default function ModularAdminSidebar({
	collapsed,
	onToggleCollapsed,
	onLinkClick,
	showStatusIndicators = true,
	className
}: ModularAdminSidebarProps) {
	const [location] = useLocation();
	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();

	// Get permission-aware navigation structure
	const { navigationItems, isLoading } = useAdminNavigation();

	// Group navigation items by their order and create hierarchy
	const navigationStructure = useMemo(() => {
		// Group modules by order to create logical sections
		const grouped = navigationItems.reduce(
			(acc, module) => {
				const section = Math.floor(module.order / 10); // Group by tens (0-9, 10-19, etc.)
				if (!acc[section]) acc[section] = [];
				acc[section].push(module);
				return acc;
			},
			{} as Record<number, AdminModule[]>
		);

		// Sort within each section
		Object.keys(grouped).forEach((key) => {
			grouped[Number(key)]?.sort((a, b) => a.order - b.order);
		});

		return grouped;
	}, [navigationItems]);

	// Helper to expand/collapse a submenu category
	const toggleCategory = useCallback((moduleId: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[moduleId]: !prev[moduleId]
		}));
	}, []);

	// Check if a module/route is active
	const isModuleActive = useCallback(
		(module: AdminModule): boolean => {
			// Check main route
			if (location === module.route) return true;

			// Check submodules
			if (module.subModules) {
				return module.subModules.some((sub) => location === sub.route);
			}

			return false;
		},
		[location]
	);

	// Handle link clicks
	const handleLinkClick = useCallback(
		(module: AdminModule, event: React.MouseEvent) => {
			const hasSubModules = module.subModules && module.subModules.length > 0;

			if (hasSubModules) {
				event.preventDefault();
				toggleCategory(module.id);
			} else {
				onLinkClick?.();
			}
		},
		[toggleCategory, onLinkClick]
	);

	// Render module icon
	const renderModuleIcon = useCallback((module: AdminModule) => {
		const IconComponent = getIconComponent(module.icon);
		return <IconComponent className="w-4 h-4 flex-shrink-0" />;
	}, []);

	// Render status indicator
	const renderStatusIndicator = useCallback(
		(module: AdminModule) => {
			if (!showStatusIndicators) return null;

			const status = getModuleStatus(module);
			const StatusIcon = status.icon;

			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<StatusIcon className={cn('w-3 h-3', status.color)} />
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>{status.tooltip}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
		[showStatusIndicators]
	);

	// Render navigation module
	const renderModule = useCallback(
		(module: AdminModule, isSubModule = false) => {
			const isActive = isModuleActive(module);
			const hasSubModules = module.subModules && module.subModules.length > 0;
			const isExpanded = expandedCategories[module.id];

			return (
				<div key={module.id} className={cn('space-y-1', isSubModule && 'ml-6')}>
					{/* Main module link */}
					<Link
						href={hasSubModules ? '#' : module.route}
						onClick={(e) => handleLinkClick(module, e)}
						className={cn(
							'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg group transition-all duration-200',
							isActive
								? 'bg-admin-text-accent/10 text-admin-text-accent border border-admin-text-accent/20'
								: 'text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-surface-hover',
							!module.enabled && 'opacity-50',
							collapsed && 'justify-center',
							isSubModule && 'text-xs'
						)}
					>
						{/* Module icon */}
						<div className="flex items-center gap-2">
							{renderModuleIcon(module)}
							{!collapsed && showStatusIndicators && renderStatusIndicator(module)}
						</div>

						{/* Module name and submenu indicator */}
						{!collapsed && (
							<div className="flex items-center justify-between flex-1 min-w-0">
								<span className="truncate">{module.name}</span>

								<div className="flex items-center gap-1 ml-2">
									{/* Beta/Status badges */}
									{module.settings?.beta && (
										<Badge variant="secondary" className="text-xs px-1 py-0">
											β
										</Badge>
									)}

									{/* Submenu chevron */}
									{hasSubModules && (
										<div className="flex-shrink-0">
											{isExpanded ? (
												<ChevronUp className="w-4 h-4" />
											) : (
												<ChevronDown className="w-4 h-4" />
											)}
										</div>
									)}
								</div>
							</div>
						)}
					</Link>

					{/* Submodules */}
					{!collapsed && hasSubModules && isExpanded && module.subModules && (
						<div className="ml-6 space-y-1 border-l border-admin-border pl-3">
							{module.subModules.map((subModule) => renderModule(subModule, true))}
						</div>
					)}
				</div>
			);
		},
		[
			collapsed,
			isModuleActive,
			expandedCategories,
			handleLinkClick,
			renderModuleIcon,
			renderStatusIndicator,
			showStatusIndicators
		]
	);

	if (isLoading) {
		return (
			<aside
				className={cn(
					'h-full bg-admin-surface border-r border-admin-border flex-shrink-0 flex flex-col transition-all duration-300',
					collapsed ? 'w-16' : 'w-72',
					className
				)}
			>
				<div className="p-4 flex items-center justify-center">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-admin-text-accent"></div>
				</div>
			</aside>
		);
	}

	return (
		<aside
			className={cn(
				'h-full bg-admin-surface border-r border-admin-border flex-shrink-0 flex flex-col transition-all duration-300 shadow-sm',
				collapsed ? 'w-16' : 'w-72',
				className
			)}
		>
			{/* Header with toggle */}
			<div className="flex items-center justify-between p-4 border-b border-admin-border">
				{!collapsed && (
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-admin-text-primary">Admin Panel</h2>
						{user?.role && (
							<Badge
								variant="outline"
								className="text-xs border-admin-border text-admin-text-secondary"
							>
								{user.role}
							</Badge>
						)}
					</div>
				)}

				<Button
					variant="ghost"
					size="sm"
					onClick={onToggleCollapsed}
					className="p-2 hover:bg-admin-surface-hover text-admin-text-secondary hover:text-admin-text-primary"
				>
					{collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
				</Button>
			</div>

			{/* Navigation content */}
			<div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
				{Object.entries(navigationStructure).map(([sectionKey, modules]) => (
					<div key={sectionKey} className="space-y-2">
						{/* Section header (optional, based on grouping) */}
						{!collapsed && modules.length > 1 && (
							<div className="text-xs font-medium text-admin-text-secondary uppercase tracking-wider px-3">
								{Number(sectionKey) === 0
									? 'Core'
									: Number(sectionKey) === 1
										? 'Management'
										: Number(sectionKey) === 2
											? 'Tools'
											: 'Advanced'}
							</div>
						)}

						{/* Section modules */}
						<nav className="space-y-1">{modules.map((module) => renderModule(module))}</nav>
					</div>
				))}

				{/* Empty state */}
				{navigationItems.length === 0 && (
					<div className="text-center py-8">
						<AlertCircle className="w-8 h-8 text-admin-text-secondary mx-auto mb-2" />
						{!collapsed && (
							<p className="text-sm text-admin-text-secondary">No admin modules available</p>
						)}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="border-t border-admin-border p-4">
				{!collapsed ? (
					<div className="space-y-2">
						<Link
							href="/"
							className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
							onClick={onLinkClick}
						>
							<ExternalLink className="w-4 h-4" />
							View Site
						</Link>

						<div className="text-xs text-gray-500 dark:text-gray-500">
							{navigationItems.length} modules loaded
						</div>
					</div>
				) : (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link href="/" onClick={onLinkClick}>
									<ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>View Site</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>
		</aside>
	);
}
