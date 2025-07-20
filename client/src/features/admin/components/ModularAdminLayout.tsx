/**
 * Modular Admin Layout Component
 *
 * The main layout wrapper for the admin panel that integrates the
 * modular sidebar with responsive behavior and mobile support.
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import ModularAdminSidebar from './ModularAdminSidebar.tsx';
import AdminThemeProvider from './AdminThemeProvider.tsx';
import { cn } from '@/utils/utils';

interface ModularAdminLayoutProps {
	children: ReactNode;
	className?: string;
}

export default function ModularAdminLayout({ children, className }: ModularAdminLayoutProps) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

	// Responsive breakpoints
	const isMobile = useMediaQuery('(max-width: 768px)');
	const isTablet = useMediaQuery('(max-width: 1024px)');

	// Auto-collapse sidebar on tablet
	useEffect(() => {
		if (isTablet && !isMobile) {
			setSidebarCollapsed(true);
		}
	}, [isTablet, isMobile]);

	// Close mobile drawer when navigating
	const handleLinkClick = () => {
		setMobileDrawerOpen(false);
	};

	// Toggle desktop sidebar
	const toggleSidebar = () => {
		if (isMobile) {
			setMobileDrawerOpen(!mobileDrawerOpen);
		} else {
			setSidebarCollapsed(!sidebarCollapsed);
		}
	};

	return (
		<AdminThemeProvider {...(className && { className })}>
			<div className="min-h-screen flex">
				{/* Desktop Sidebar */}
				{!isMobile && (
					<ModularAdminSidebar
						collapsed={sidebarCollapsed}
						onToggleCollapsed={toggleSidebar}
						onLinkClick={handleLinkClick}
						showStatusIndicators={true}
					/>
				)}

				{/* Mobile Sidebar (Sheet) */}
				{isMobile && (
					<>
						{/* Mobile Header */}
						<div className="fixed top-0 left-0 right-0 z-50 bg-admin-surface border-b border-admin-border px-4 py-3 flex items-center justify-between">
							<h1 className="text-lg font-semibold text-admin-text-primary">Admin Panel</h1>
							<button
								onClick={toggleSidebar}
								className="p-2 hover:bg-admin-surface-hover rounded-lg transition-colors"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
						</div>

						{/* Mobile Sheet */}
						<Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
							<SheetContent side="left" className="p-0 w-80 bg-admin-surface border-admin-border">
								<ModularAdminSidebar
									collapsed={false}
									onToggleCollapsed={() => setMobileDrawerOpen(false)}
									onLinkClick={handleLinkClick}
									showStatusIndicators={true}
									className="border-none shadow-none"
								/>
							</SheetContent>
						</Sheet>
					</>
				)}

				{/* Main Content Area */}
				<main
					className={cn(
						'flex-1 flex flex-col min-h-screen transition-all duration-300',
						isMobile && 'pt-16' // Account for mobile header
					)}
				>
					{/* Content wrapper */}
					<div className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
						{/* Constrain width and add vertical rhythm */}
						<div className="max-w-7xl mx-auto space-y-8">{children}</div>
					</div>
				</main>
			</div>
		</AdminThemeProvider>
	);
}
