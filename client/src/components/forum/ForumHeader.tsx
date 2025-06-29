import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MergedForum } from '@/contexts/ForumStructureContext';

export interface ForumHeaderProps {
	forum: MergedForum;
	className?: string;
	variant?: 'compact' | 'detailed' | 'minimal';
	slots?: {
		actions?: React.ReactNode;
		stats?: React.ReactNode;
		description?: React.ReactNode;
	};
	onNewThread?: () => void;
}

/**
 * ForumHeader Component
 *
 * A composable header component for forum pages that displays:
 * - Forum icon, name, and description
 * - Thread/post statistics
 * - Primary actions (New Thread button)
 *
 * Supports slots for custom content injection
 */
export const ForumHeader: React.FC<ForumHeaderProps> = ({
	forum,
	className,
	variant = 'detailed',
	slots,
	onNewThread
}) => {
	const renderCompactHeader = () => (
		<div className={cn('flex items-center justify-between', className)}>
			<div className="flex items-center gap-3">
				{forum.theme?.icon && (
					<div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center text-xl">
						{forum.theme.icon}
					</div>
				)}
				<div>
					<h1 className="text-2xl font-bold text-white">{forum.name}</h1>
					<div className="flex items-center gap-4 text-sm text-zinc-400">
						<span>{forum.threadCount} threads</span>
						<span>{forum.postCount} posts</span>
					</div>
				</div>
			</div>
			{slots?.actions || (
				<Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onNewThread}>
					<Plus className="w-4 h-4 mr-2" />
					New Thread
				</Button>
			)}
		</div>
	);

	const renderDetailedHeader = () => (
		<div className={cn('space-y-4', className)}>
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						{forum.theme?.icon && (
							<div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center text-2xl">
								{forum.theme.icon}
							</div>
						)}
						<div>
							<h1 className="text-3xl font-bold text-white">{forum.name}</h1>
							{slots?.description || <p className="text-zinc-400">{forum.description}</p>}
						</div>
					</div>
					{slots?.stats || (
						<div className="flex items-center gap-4 text-sm text-zinc-400">
							<div className="flex items-center gap-1">
								<MessageSquare className="w-4 h-4" />
								<span>{forum.threadCount} threads</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{forum.postCount} posts</span>
							</div>
						</div>
					)}
				</div>
				{slots?.actions || (
					<Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onNewThread}>
						<Plus className="w-4 h-4 mr-2" />
						New Thread
					</Button>
				)}
			</div>
		</div>
	);

	const renderMinimalHeader = () => (
		<div className={cn('flex items-center justify-between', className)}>
			<h1 className="text-xl font-semibold text-white">{forum.name}</h1>
			{slots?.actions || (
				<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onNewThread}>
					<Plus className="w-4 h-4" />
				</Button>
			)}
		</div>
	);

	switch (variant) {
		case 'compact':
			return renderCompactHeader();
		case 'minimal':
			return renderMinimalHeader();
		case 'detailed':
		default:
			return renderDetailedHeader();
	}
};

// Compound component exports for flexibility
ForumHeader.displayName = 'ForumHeader';
