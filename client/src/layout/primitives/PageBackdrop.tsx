import React from 'react';
import { cn } from '@/utils/utils';

interface PageBackdropProps {
	className?: string;
	children: React.ReactNode;
}

/**
 * PageBackdrop – full-viewport gradient background used by all forum pages.
 * Keeps the beloved black→zinc diagonal fade from the thread page.
 */
export const PageBackdrop: React.FC<PageBackdropProps> = ({ className, children }) => (
	<div className={cn('min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black', className)}>
		{children}
	</div>
);
