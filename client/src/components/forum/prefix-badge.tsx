import { cn } from '@/utils/utils'; // Assuming you have a cn utility for class names

interface PrefixBadgeProps {
	prefix?: {
		name: string;
		color?: string | null; // Allow color to be null as it might be in ThreadPrefix
	};
}

export function PrefixBadge({ prefix }: PrefixBadgeProps) {
	if (!prefix) {
		return null; // Or some placeholder if prefix is undefined
	}

	const themeColor = prefix.color || 'indigo'; // Default color if none provided

	// Define base classes that use the new CSS variable-driven Tailwind classes
	const baseClasses = 'inline-flex items-center rounded px-2 py-0.5 text-sm font-medium';

	// Static classes that will use the CSS variables defined by the theme class
	const staticBadgeClasses = cn(
		baseClasses,
		'bg-badge-bg-light dark:bg-badge-bg-dark',
		'text-badge-text-light dark:text-badge-text-dark',
		'border border-badge-border-light dark:border-badge-border-dark'
	);

	// The theme class itself will be dynamic
	const themeClassName = `theme-badge-${themeColor}`;

	return <span className={cn(themeClassName, staticBadgeClasses)}>{prefix.name}</span>;
}
