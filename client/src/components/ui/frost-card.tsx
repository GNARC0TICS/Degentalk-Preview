import React from 'react';
import { Card } from '@app/components/ui/card';
import { cn } from '@app/utils/utils';

export interface FrostCardProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Variant color theme.
	 * Accepts a string like "emerald", "orange" etc. to accent the hover border.
	 * Defaults to "zinc" (no accent).
	 */
	accentColor?: string;
}

/**
 * FrostCard – shared glass-panel card used across forum pages.
 * Wraps the default <Card> and injects a lower-opacity background,
 * backdrop blur and soft border.
 */
export const FrostCard: React.FC<FrostCardProps> = ({ accentColor, className, ...props }) => {
	const accentClass = accentColor ? `hover:border-${accentColor}-500/30` : '';
	return (
		<Card
			className={cn(
				'bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 shadow-lg transition-colors duration-300',
				accentClass,
				className
			)}
			{...props}
		/>
	);
};
