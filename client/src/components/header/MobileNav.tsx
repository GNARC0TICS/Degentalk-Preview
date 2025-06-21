import React from 'react';
import { useLocation } from 'wouter';
import { IconRenderer } from '@/components/icons/iconRenderer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NavLink } from './NavLink';
import { SearchBox } from './SearchBox';
import { primaryNavigation, filterNavItems } from '@/config/navigation';
import { useHeader } from './HeaderContext';

interface MobileNavProps {
	isOpen: boolean;
	onClose: () => void;
	onLogout?: () => void;
}

export function MobileNav({ isOpen, onClose, onLogout }: MobileNavProps) {
	const [location] = useLocation();
	const { authStatus, user, toggleWallet } = useHeader();

	const isAuthenticated = authStatus !== 'guest' && authStatus !== 'loading';
	const userRoles = user?.isAdmin
		? (['admin', 'mod', 'user'] as const)
		: user?.isModerator
			? (['mod', 'user'] as const)
			: (['user'] as const);

	const visibleNavigation = filterNavItems(primaryNavigation, isAuthenticated, userRoles);

	if (!isOpen) return null;

	return (
		<div className="md:hidden bg-zinc-900 border-t border-zinc-800">
			<div className="px-2 pt-2 pb-3 space-y-1">
				{/* Mobile Search */}
				<div className="p-2">
					<SearchBox />
				</div>

				{/* Navigation Items */}
				{visibleNavigation.map((item) => (
					<NavLink key={item.label} href={item.href} analyticsLabel={item.analyticsLabel}>
						<div
							className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
								item.href === location
									? 'bg-zinc-800 text-white'
									: 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
							} transition-colors`}
							onClick={onClose}
						>
							{item.label}
						</div>
					</NavLink>
				))}

				{/* Authenticated User Section */}
				{isAuthenticated && user ? (
					<div className="pt-4 pb-3 border-t border-zinc-800">
						<div className="flex items-center px-3">
							<div className="flex-shrink-0">
								<Avatar className="h-10 w-10">
									<AvatarFallback className="bg-emerald-800 text-emerald-200">
										{user.username.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</div>
							<div className="ml-3">
								<div className="text-base font-medium text-white">{user.username}</div>
								<div className="text-sm font-medium text-zinc-500">Level {user.level || '0'}</div>
							</div>
						</div>

						<div className="mt-3 px-2 space-y-1">
							<NavLink href={`/profile/${user.username}`}>
								<div
									className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
									onClick={onClose}
								>
									<IconRenderer icon="profile" size={20} className="h-5 w-5 inline mr-2" />
									Profile
								</div>
							</NavLink>

							<div
								className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
								onClick={() => {
									onClose();
									toggleWallet();
								}}
							>
								<IconRenderer icon="wallet" size={20} className="h-5 w-5 inline mr-2" />
								Wallet
							</div>

							<NavLink href="/whispers">
								<div
									className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
									onClick={onClose}
								>
									<IconRenderer icon="message" size={20} className="h-5 w-5 inline mr-2" />
									Whispers (DMs)
								</div>
							</NavLink>

							<NavLink href="/preferences">
								<div
									className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
									onClick={onClose}
								>
									<IconRenderer icon="settings" size={20} className="h-5 w-5 inline mr-2" />
									Settings
								</div>
							</NavLink>

							<NavLink href="/preferences?tab=referrals">
								<div
									className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
									onClick={onClose}
								>
									<IconRenderer icon="link" size={20} className="h-5 w-5 inline mr-2" />
									Referrals
								</div>
							</NavLink>

							{user.isAdmin && (
								<NavLink href="/admin">
									<div
										className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
										onClick={onClose}
									>
										<IconRenderer icon="admin" size={20} className="h-5 w-5 inline mr-2" />
										Admin Panel
									</div>
								</NavLink>
							)}

							{user.isModerator && (
								<NavLink href="/mod">
									<div
										className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
										onClick={onClose}
									>
										<IconRenderer icon="admin" size={20} className="h-5 w-5 inline mr-2" />
										Moderator Panel
									</div>
								</NavLink>
							)}

							<div
								className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
								onClick={() => {
									onLogout?.();
									onClose();
								}}
							>
								<IconRenderer icon="logout" size={20} className="h-5 w-5 inline mr-2" />
								Log Out
							</div>
						</div>
					</div>
				) : (
					/* Guest User Section */
					<div className="pt-4 pb-3 border-t border-zinc-800 px-3 space-y-2">
						<NavLink href="/forums" analyticsLabel="mobile_signup">
							<Button
								className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
								onClick={onClose}
							>
								Sign Up
							</Button>
						</NavLink>
						<NavLink href="/auth" analyticsLabel="mobile_login">
							<Button
								className="w-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
								onClick={onClose}
							>
								Log In
							</Button>
						</NavLink>
					</div>
				)}
			</div>
		</div>
	);
}
