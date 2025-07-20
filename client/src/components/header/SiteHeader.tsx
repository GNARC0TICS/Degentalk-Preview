import React, { useState } from 'react';
import ChartMenu from '@/components/ui/candlestick-menu';
import { WalletSheet } from '@/features/wallet/components/WalletSheet';
import { useAuthWrapper } from '@/hooks/wrappers/use-auth-wrapper';
import { HeaderThemeWrapper } from './HeaderThemeWrapper.tsx';
import { HeaderPluginSlot } from './HeaderPluginSlot.tsx';
import { Logo } from './Logo.tsx';
import { PrimaryNav } from './PrimaryNav.tsx';
import { SearchBox } from './SearchBox.tsx';
import { NotificationButton } from './NotificationButton.tsx';
import { WalletButton } from './WalletButton.tsx';
import { AdminButton } from './AdminButton.tsx';
import { UserMenu } from './UserMenu.tsx';
import { AuthButtons } from './AuthButtons.tsx';
import { MobileNav } from './MobileNav.tsx';
import { useHeader } from './HeaderContext.tsx';

// Removed dev mode check - using real auth only

export function SiteHeader() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { logoutMutation } = useAuthWrapper() || {};
	const { authStatus, user, walletOpen, toggleWallet } = useHeader();

	const isAuthenticated = authStatus !== 'guest' && authStatus !== 'loading';

	// Handle logout
	const handleLogout = () => {
		if (logoutMutation?.mutate) {
			logoutMutation.mutate(undefined);
		}
	};

	return (
		<HeaderThemeWrapper>
			<div className="px-4">
				<div className="flex items-center justify-between h-16">
					{/* Left Section: Logo + Navigation */}
					<div className="flex items-center space-x-4 lg:space-x-6">
						<Logo />
						<PrimaryNav />
					</div>

					{/* Search Box - Center with better responsive sizing */}
					{/*
					  Search bar is now visible at md and up (≥768px), matching the desktop nav and icons.
					*/}
					<div className="hidden md:flex flex-1 max-w-sm xl:max-w-md 2xl:max-w-lg mx-4 lg:mx-6">
						<SearchBox />
					</div>

					{/* User Section */}
					{/*
					  Desktop user icons are only shown at md and up (≥768px).
					  Hamburger menu is only shown below md (<768px).
					  This ensures a clean switch between desktop and mobile views at the 768px breakpoint.
					*/}
					<div className="hidden md:flex items-center">
						{isAuthenticated ? (
							<div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
								{/* Left Plugin Slot */}
								<HeaderPluginSlot position="left" />

								{/* Notification Button */}
								<NotificationButton />

								{/* Wallet Button */}
								<WalletButton />

								{/* Admin/Mod Button */}
								<AdminButton />

								{/* Right Plugin Slot */}
								<HeaderPluginSlot position="right" />

								{/* User Menu */}
								<UserMenu onLogout={handleLogout} />
							</div>
						) : (
							<AuthButtons />
						)}
					</div>

					{/* Mobile/Tablet menu button */}
					{/*
					  Hamburger menu is shown on screens smaller than md (<768px).
					  This matches the desktop icon breakpoint above, so only one is ever visible.
					*/}
					<div className="flex md:hidden items-center">
						<div className="p-1.5">
							<ChartMenu
								isActive={isMobileMenuOpen}
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="scale-90"
								id="mobile-menu-button"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			<MobileNav
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				onLogout={handleLogout}
			/>

			{/* Wallet Sheet */}
			<WalletSheet isOpen={walletOpen} onOpenChange={toggleWallet} />
		</HeaderThemeWrapper>
	);
}
