import React from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';

interface StickyBackButtonProps {
	/** Custom back URL, defaults to browser history */
	backUrl?: string;
	/** Custom label for the button */
	label?: string;
	/** Hide the button on certain routes */
	hideOnRoutes?: string[];
	/** Additional className */
	className?: string;
}

export default function StickyBackButton({
	backUrl,
	label = 'Back',
	hideOnRoutes = ['/'],
	className
}: StickyBackButtonProps) {
	const location = useLocation();
	const breakpoint = useBreakpoint();

	// Only show on mobile and tablet
	if (!breakpoint.isMobileOrTablet) {
		return null;
	}

	// Hide on specified routes
	if (hideOnRoutes.includes(location.pathname)) {
		return null;
	}

	const handleBack = () => {
		if (backUrl) {
			window.location.href = backUrl;
		} else {
			window.history.back();
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.2 }}
				className={cn('fixed bottom-6 left-4 z-40', className)}
			>
				<Button
					onClick={handleBack}
					size="lg"
					className={cn(
						'h-12 px-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50',
						'hover:bg-zinc-800/90 active:scale-95 transition-all shadow-lg',
						'text-white'
					)}
				>
					<ArrowLeft className="w-5 h-5 mr-2" />
					{breakpoint.isMobile ? '' : label}
				</Button>
			</motion.div>
		</AnimatePresence>
	);
}
