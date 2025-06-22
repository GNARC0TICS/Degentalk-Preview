import React, { useEffect, useState } from 'react';
import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';
import { SlotRenderer } from './SlotRenderer';
import { WidgetGallery } from './WidgetGallery';
import { Button } from '@/components/ui/button';
import { Settings2, Sidebar, SidebarClose, PanelLeft, PanelRight } from 'lucide-react';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ENABLE_WIDGETS } from '@/config/featureFlags';

interface ResponsiveLayoutWrapperProps {
	page: 'home' | 'forum' | 'profile';
	children: React.ReactNode;
	className?: string;
}

export const ResponsiveLayoutWrapper: React.FC<ResponsiveLayoutWrapperProps> = ({
	page,
	children,
	className
}) => {
	if (!ENABLE_WIDGETS) {
		return <div className="min-h-screen flex flex-col">{children}</div>;
	}

	const sidebars = useLayoutStore((s) => s.sidebars);
	const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);
	const swapSidebars = useLayoutStore((s) => s.swapSidebars);

	const isDesktop = useMediaQuery('(min-width: 1024px)');
	const isTablet = useMediaQuery('(min-width: 768px)');
	const isMobile = !isTablet;

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'left' | 'right'>('right');

	// Auto-hide sidebars on mobile
	useEffect(() => {
		if (isMobile && (sidebars.left.isVisible || sidebars.right.isVisible)) {
			// Store previous state for restoration
			localStorage.setItem('desktop-sidebar-state', JSON.stringify(sidebars));
			// Hide both sidebars on mobile
			if (sidebars.left.isVisible) toggleSidebar('left');
			if (sidebars.right.isVisible) toggleSidebar('right');
		} else if (isDesktop) {
			// Restore sidebar state on desktop
			const savedState = localStorage.getItem('desktop-sidebar-state');
			if (savedState) {
				try {
					const state = JSON.parse(savedState);
					if (!sidebars.left.isVisible && state.left.isVisible) toggleSidebar('left');
					if (!sidebars.right.isVisible && state.right.isVisible) toggleSidebar('right');
				} catch (e) {
					// Ignore parse errors
				}
			}
		}
	}, [isMobile, isDesktop]);

	// Determine layout classes
	const layoutClasses = cn('min-h-screen bg-black text-white flex flex-col', className);

	const contentWrapperClasses = cn(
		'flex-1 flex flex-col lg:flex-row gap-4 px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8',
		'transition-all duration-300'
	);

	const mainContentClasses = cn(
		'flex-1 w-full',
		isDesktop && sidebars.left.isVisible && 'lg:ml-4',
		isDesktop && sidebars.right.isVisible && 'lg:mr-4'
	);

	const sidebarClasses = (side: 'left' | 'right') => {
		const visibility = sidebars[side].isVisible ? 'block' : 'hidden';
		const width = sidebars[side].width === 'thin' ? 'lg:w-64' : 'lg:w-80 xl:w-96';
		return cn(
			visibility,
			width,
			'space-y-4 transition-all duration-300',
			'lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]',
			'overflow-y-auto custom-scrollbar'
		);
	};

	// Mobile sidebar content
	const MobileSidebarContent = () => (
		<div className="flex flex-col h-full">
			<div className="flex border-b border-zinc-800 mb-4">
				<button
					className={cn(
						'flex-1 py-3 text-sm font-medium transition-colors',
						activeTab === 'left'
							? 'text-white border-b-2 border-emerald-500'
							: 'text-zinc-400 hover:text-white'
					)}
					onClick={() => setActiveTab('left')}
				>
					Left Sidebar
				</button>
				<button
					className={cn(
						'flex-1 py-3 text-sm font-medium transition-colors',
						activeTab === 'right'
							? 'text-white border-b-2 border-emerald-500'
							: 'text-zinc-400 hover:text-white'
					)}
					onClick={() => setActiveTab('right')}
				>
					Right Sidebar
				</button>
			</div>

			<div className="flex-1 overflow-y-auto">
				{activeTab === 'left' ? (
					<SlotRenderer slotId="sidebar/left" />
				) : (
					<SlotRenderer slotId="sidebar/right" />
				)}
			</div>

			<div className="p-4 border-t border-zinc-800">
				<WidgetGallery
					targetSlot={activeTab === 'left' ? 'sidebar/left' : 'sidebar/right'}
					className="w-full"
				/>
			</div>
		</div>
	);

	// Layout controls
	const LayoutControls = () => (
		<div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
			{/* Mobile menu toggle */}
			{isMobile && (
				<Button
					size="icon"
					variant="default"
					onClick={() => setMobileMenuOpen(true)}
					className="h-12 w-12 rounded-full shadow-lg"
				>
					<Sidebar className="h-5 w-5" />
					<span className="sr-only">Open sidebar menu</span>
				</Button>
			)}

			{/* Desktop sidebar toggles */}
			{isDesktop && (
				<>
					<Button
						size="icon"
						variant="outline"
						onClick={() => toggleSidebar('left')}
						className="h-10 w-10 rounded-full"
						title={sidebars.left.isVisible ? 'Hide left sidebar' : 'Show left sidebar'}
					>
						{sidebars.left.isVisible ? (
							<PanelLeft className="h-4 w-4" />
						) : (
							<SidebarClose className="h-4 w-4" />
						)}
					</Button>
					<Button
						size="icon"
						variant="outline"
						onClick={() => toggleSidebar('right')}
						className="h-10 w-10 rounded-full"
						title={sidebars.right.isVisible ? 'Hide right sidebar' : 'Show right sidebar'}
					>
						{sidebars.right.isVisible ? (
							<PanelRight className="h-4 w-4" />
						) : (
							<SidebarClose className="h-4 w-4 rotate-180" />
						)}
					</Button>
					<Button
						size="icon"
						variant="outline"
						onClick={swapSidebars}
						className="h-10 w-10 rounded-full"
						title="Swap sidebars"
					>
						<Settings2 className="h-4 w-4" />
					</Button>
				</>
			)}
		</div>
	);

	const leftSidebarOrder = sidebars.position === 'left-right' ? 'order-1' : 'order-3';
	const rightSidebarOrder = sidebars.position === 'left-right' ? 'order-3' : 'order-1';

	return (
		<div className={layoutClasses}>
			<div className={contentWrapperClasses}>
				{/* Desktop Left Sidebar */}
				{isDesktop && (
					<aside className={cn(sidebarClasses('left'), leftSidebarOrder)}>
						<SlotRenderer slotId="sidebar/left" />
						<div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-4">
							<WidgetGallery targetSlot="sidebar/left" className="w-full" />
						</div>
					</aside>
				)}

				{/* Main Content */}
				<main className={cn(mainContentClasses, 'order-2')}>
					<SlotRenderer slotId="main/top" className="mb-6" />
					{/* Mobile-specific widgets - show essential widgets on mobile when sidebars are hidden */}
					{isMobile && (
						<div className="space-y-6 mb-6">
							<SlotRenderer slotId="mobile/widgets" className="grid grid-cols-1 gap-4" />
						</div>
					)}
					{children}
					<SlotRenderer slotId="main/bottom" className="mt-6" />
				</main>

				{/* Desktop Right Sidebar */}
				{isDesktop && (
					<aside className={cn(sidebarClasses('right'), rightSidebarOrder)}>
						<SlotRenderer slotId="sidebar/right" />
						<div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-4">
							<WidgetGallery targetSlot="sidebar/right" className="w-full" />
						</div>
					</aside>
				)}
			</div>

			{/* Mobile Sidebar Sheet */}
			<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
				<SheetContent side="right" className="w-full sm:w-96 p-0">
					<SheetHeader className="p-4 border-b border-zinc-800">
						<SheetTitle>Widgets & Navigation</SheetTitle>
						<SheetDescription>Customize your layout and access navigation</SheetDescription>
					</SheetHeader>
					<MobileSidebarContent />
				</SheetContent>
			</Sheet>

			{/* Layout Controls */}
			<LayoutControls />
		</div>
	);
};
