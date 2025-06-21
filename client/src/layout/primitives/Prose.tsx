import React from 'react';
import { cn } from '@/lib/utils';

interface ProseProps extends React.HTMLAttributes<HTMLElement> {
	as?: keyof JSX.IntrinsicElements;
}

/**
 * Prose
 * Centres long-form text and constrains line length for readability.
 * Default max width is 65ch.
 */
export const Prose: React.FC<ProseProps> = ({
	as: Component = 'article',
	className = '',
	...props
}) => {
	return (
		<Component
			{...props}
			className={cn('mx-auto w-full max-w-[65ch] px-4 prose prose-invert', className)}
		/>
	);
};
