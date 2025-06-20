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

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

export function HeaderProvider({ children, theme }: HeaderProviderProps) {
	const { user, isLoading } = useAuthWrapper() || {};

	// State
	const [walletOpen, setWalletOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [currentTheme, setCurrentTheme] = useState<HeaderTheme | undefined>(theme);

	// Mock data for development
	const mockUser: HeaderUser = {
		username: 'DevUser',
		level: 99,
		xp: 15750,
		isAdmin: true,
		isModerator: true
	};

	// Determine auth status
	const getAuthStatus = (): AuthStatus => {
		if (isDevelopment) {
			return 'admin'; // Always admin in dev
		}

		if (isLoading) {
			return 'loading';
		}

		if (!user) {
			return 'guest';
		}

		if (user.isAdmin) {
			return 'admin';
		}

		return 'user';
	};

	// Get display user
	const displayUser = isDevelopment ? mockUser : (user as HeaderUser | undefined);

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
