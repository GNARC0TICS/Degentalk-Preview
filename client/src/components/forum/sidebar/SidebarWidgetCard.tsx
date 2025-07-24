import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { useForumTheme } from '@app/features/forum/contexts/ForumThemeProvider';
import { cn } from '@app/utils/utils';

interface SidebarWidgetCardProps {
	title: string;
	icon?: LucideIcon;
	colorTheme?: string;
	className?: string;
	slots?: {
		body?: React.ReactNode;
		footer?: React.ReactNode;
	};
}

export function SidebarWidgetCard({
	title,
	icon: Icon,
	colorTheme,
	className = '',
	slots = {}
}: SidebarWidgetCardProps) {
	const { getTheme } = useForumTheme();
	const theme = getTheme(colorTheme);

	// Resolve icon and color from theme or props
	const ResolvedIcon = Icon || (typeof theme.icon === 'function' ? theme.icon : null);
	const iconColor = theme.color || 'text-zinc-400';

	return (
		<div
			className={cn(
				'bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/50 rounded-lg shadow-lg',
				'hover:border-zinc-600/50 transition-colors',
				className
			)}
		>
			{/* Header */}
			<div className="px-4 py-3 border-b border-zinc-700/30">
				<h3 className="flex items-center gap-2 text-base font-semibold text-zinc-100">
					{ResolvedIcon && <ResolvedIcon className={cn('h-4 w-4', iconColor)} />}
					{title}
				</h3>
			</div>

			{/* Body */}
			{slots.body && <div className="p-4">{slots.body}</div>}

			{/* Footer */}
			{slots.footer && <div className="px-4 py-3 border-t border-zinc-700/30">{slots.footer}</div>}
		</div>
	);
}
