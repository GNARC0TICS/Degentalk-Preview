/**
 * Admin Theme Provider
 *
 * Provides admin-specific theming and ensures consistent design tokens
 * across all admin components
 */

import type { ReactNode } from 'react';
import { cn } from '@app/utils/utils';

interface AdminThemeProviderProps {
	children: ReactNode;
	className?: string;
}

export default function AdminThemeProvider({ children, className }: AdminThemeProviderProps) {
	return (
		<div
			className={cn(
				'bg-admin-page text-admin-text-primary min-h-screen',
				'[&_*]:transition-colors [&_*]:duration-200', // Smooth transitions for all elements
				className
			)}
		>
			{children}
		</div>
	);
}

export { AdminThemeProvider };
