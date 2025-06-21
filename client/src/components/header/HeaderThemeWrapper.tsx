import React from 'react';
import { useHeader } from './HeaderContext';

interface HeaderThemeWrapperProps {
	children: React.ReactNode;
	className?: string;
}

export function HeaderThemeWrapper({ children, className }: HeaderThemeWrapperProps) {
	const { theme, isScrolled } = useHeader();

	// Generate CSS custom properties for theme
	const themeStyles: React.CSSProperties = theme
		? {
				'--header-theme-color': theme.color,
				'--header-theme-opacity': isScrolled ? '0.9' : '0.8'
			}
		: {};

	// Apply theme classes if available
	const themeClasses = theme?.colorTheme ? `${theme.colorTheme}` : '';

	return (
		<header
			className={`bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md transition-all ${themeClasses} ${className}`}
			style={themeStyles}
		>
			{children}
		</header>
	);
}
