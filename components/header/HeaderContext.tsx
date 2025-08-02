'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface HeaderTheme {
	color: string;
	icon?: React.ReactNode;
	colorTheme?: string;
}

export interface HeaderContextValue {
	// UI state
	isScrolled: boolean;
	theme?: HeaderTheme;

	// Actions
	setTheme(theme: HeaderTheme): void;
}

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined);

interface HeaderProviderProps {
	children: ReactNode;
	theme?: HeaderTheme;
}

export function HeaderProvider({ children, theme }: HeaderProviderProps) {
	const [isScrolled, setIsScrolled] = useState(false);
	const [currentTheme, setCurrentTheme] = useState<HeaderTheme | undefined>(theme);

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
		isScrolled,
		theme: currentTheme,
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