import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthWrapper } from '@/hooks/wrappers/use-auth-wrapper';

export type AuthStatus = 'loading' | 'guest' | 'user' | 'admin';

export interface HeaderUser {
	username: string;
	level: number;
	xp: number;
	isAdmin?: boolean;
	isModerator?: boolean;
}

export interface HeaderTheme {
	color: string;
	icon?: React.ReactNode;
	colorTheme?: string;
}

export interface HeaderContextValue {
	// Auth state
	authStatus: AuthStatus;
	user?: HeaderUser;

	// UI state
	unreadNotifications: number;
	walletOpen: boolean;
	isScrolled: boolean;
	theme?: HeaderTheme;

	// Actions
	toggleWallet(): void;
	toggleNotifications(): void;
	setTheme(theme: HeaderTheme): void;
}

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined);

interface HeaderProviderProps {
	children: ReactNode;
	theme?: HeaderTheme;
}

export function HeaderProvider({ children, theme }: HeaderProviderProps) {
	// CRITICAL: Use the auth wrapper to get the SAME auth state as useAuth hook
	// This ensures the header UI is always in sync with the main auth state
	const { user, isLoading, isAuthenticated } = useAuthWrapper() || {};

	// Local UI state (not auth-related)
	const [walletOpen, setWalletOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [currentTheme, setCurrentTheme] = useState<HeaderTheme | undefined>(theme);

	// AUTH STATE MAPPING: Convert auth hook state to header-specific auth status
	// This function maps the boolean auth state to the header's enum-based status
	const getAuthStatus = (): AuthStatus => {
		if (isLoading) {
			return 'loading';
		}

		// CRITICAL: Use isAuthenticated flag to ensure consistency with useAuth
		// This prevents the "login button → authenticated UI" bug by using the same
		// auth determination logic as the main auth hook
		if (!isAuthenticated || !user) {
			return 'guest';
		}

		if (user.isAdmin) {
			return 'admin';
		}

		return 'user';
	};

	// DEFENSIVE USER DATA: Only show user when actually authenticated
	// This prevents stale user data from being displayed when auth state is invalid
	const displayUser = isAuthenticated && user ? (user as HeaderUser) : undefined;

	// Scroll detection
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Theme updates
	useEffect(() => {
		if (theme) {
			setCurrentTheme(theme);
		}
	}, [theme]);

	const contextValue: HeaderContextValue = {
		authStatus: getAuthStatus(),
		user: displayUser,
		unreadNotifications: 3, // TODO: Get from API
		walletOpen,
		isScrolled,
		theme: currentTheme,

		toggleWallet: () => setWalletOpen(!walletOpen),
		toggleNotifications: () => setNotificationsOpen(!notificationsOpen),
		setTheme: setCurrentTheme
	};

	return <HeaderContext.Provider value={contextValue}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
	const context = useContext(HeaderContext);
	if (context === undefined) {
		throw new Error('useHeader must be used within a HeaderProvider');
	}
	return context;
}
