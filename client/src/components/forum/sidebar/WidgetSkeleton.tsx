import React from 'react';
import { cn } from '@/utils/utils';

interface WidgetSkeletonProps {
	rows?: number;
	className?: string;
}

export function WidgetSkeleton({ rows = 3, className = '' }: WidgetSkeletonProps) {
	return (
		<div className={cn('space-y-3', className)}>
			{[...Array(rows)].map((_, i) => (
				<div key={i} className="space-y-2">
					{/* Primary content line */}
					<div className="h-4 w-full bg-zinc-800/60 rounded animate-pulse" />

					{/* Secondary content line */}
					<div className="flex items-center justify-between gap-3">
						<div className="h-3 w-1/3 bg-zinc-800/40 rounded animate-pulse" />
						<div className="h-3 w-1/4 bg-zinc-800/40 rounded animate-pulse" />
					</div>

					{/* Divider between rows (except last) */}
					{i < rows - 1 && <div className="pt-2 border-b border-zinc-800/30" />}
				</div>
			))}
		</div>
	);
}
