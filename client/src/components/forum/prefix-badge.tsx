import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility for class names

interface PrefixBadgeProps {
	prefix?: {
		name: string;
		color?: string | null; // Allow color to be null as it might be in ThreadPrefix
	};
}

export const PrefixBadge: React.FC<PrefixBadgeProps> = ({ prefix }) => {
	if (!prefix) {
		return null; // Or some placeholder if prefix is undefined
	}

	const color = prefix.color || 'indigo'; // Default color if none provided

	// Define base classes
	const baseClasses = 'inline-flex items-center rounded px-2 py-0.5 text-sm font-medium';

	// Dynamically generate Tailwind classes for background, text, and border
	// This approach requires Tailwind JIT to pick up these generated classes.
	// If not using JIT, or for more complex theming, consider a mapping object or CSS variables.
	const badgeClasses = cn(
		baseClasses,
		`bg-${color}-100 dark:bg-${color}-900/60`,
		`text-${color}-700 dark:text-${color}-300`,
		`border border-${color}-300 dark:border-${color}-700/30`
	);

	// Fallback for truly dynamic colors if Tailwind JIT isn't sufficient or for arbitrary hex values:
	// const style: React.CSSProperties = {};
	// if (prefix.color && !isTailwindColor(prefix.color)) { // isTailwindColor would be a helper
	//   style.backgroundColor = prefix.color; // Assuming prefix.color could be a hex
	//   style.color = getContrastColor(prefix.color); // Helper to get good text contrast
	// }

	return <span className={badgeClasses}>{prefix.name}</span>;
};
