import React, { useState } from 'react';
import ChartMenu from '@/components/ui/candlestick-menu';
import { WalletSheet } from '@/features/wallet/components/WalletSheet';
import { useAuthWrapper } from '@/hooks/wrappers/use-auth-wrapper';
import { HeaderThemeWrapper } from './HeaderThemeWrapper';
import { HeaderPluginSlot } from './HeaderPluginSlot';
import { Logo } from './Logo';
import { PrimaryNav } from './PrimaryNav';
import { SearchBox } from './SearchBox';
import { NotificationButton } from './NotificationButton';
import { WalletButton } from './WalletButton';
import { AdminButton } from './AdminButton';
import { UserMenu } from './UserMenu';
import { AuthButtons } from './AuthButtons';
import { MobileNav } from './MobileNav';
import { useHeader } from './HeaderContext';

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
					<div className="flex items-center space-x-6">
						<Logo />
						<PrimaryNav />
					</div>

					{/* Search Box - Center with better responsive sizing */}
					<div className="hidden md:flex flex-1 max-w-md lg:max-w-lg xl:max-w-xl mx-6">
						<SearchBox />
					</div>

					{/* User Section */}
					<div className="hidden md:flex items-center">
						{isAuthenticated ? (
							<div className="flex items-center space-x-4">
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

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
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
