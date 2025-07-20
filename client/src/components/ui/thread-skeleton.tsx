import React from 'react';
import { Skeleton } from './skeleton.tsx';
import { Card, CardContent, CardHeader } from './card.tsx';

export const ThreadCardSkeleton = () => (
	<Card className="mb-4 bg-zinc-900/60 border border-zinc-800">
		<CardHeader className="p-4 pb-2">
			<div className="flex items-start justify-between">
				<div className="space-y-2 flex-1">
					<Skeleton className="h-6 w-3/4" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-16" />
					</div>
				</div>
				<Skeleton className="h-8 w-20" />
			</div>
		</CardHeader>
		<CardContent className="px-4 py-3">
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-4/5" />
			</div>
			<div className="flex items-center justify-between mt-4">
				<div className="flex items-center gap-4">
					<Skeleton className="h-6 w-16" />
					<Skeleton className="h-6 w-16" />
					<Skeleton className="h-6 w-16" />
				</div>
				<Skeleton className="h-6 w-24" />
			</div>
		</CardContent>
	</Card>
);

export const ThreadListSkeleton = ({ count = 3 }: { count?: number }) => (
	<div>
		{Array.from({ length: count }).map((_, i) => (
			<ThreadCardSkeleton key={i} />
		))}
	</div>
);

export const HotThreadItemSkeleton = () => (
	<div className="p-3 md:p-4 rounded-lg bg-gradient-to-r from-zinc-800/50 to-zinc-800/30 border border-zinc-700/50">
		<div className="space-y-3">
			<div className="flex items-start justify-between">
				<Skeleton className="h-6 w-20 rounded-full" />
				<Skeleton className="h-4 w-4" />
			</div>
			<Skeleton className="h-5 w-3/4" />
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Skeleton className="h-6 w-6 rounded-full" />
					<Skeleton className="h-4 w-16" />
				</div>
				<Skeleton className="h-4 w-1" />
				<Skeleton className="h-4 w-12" />
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-6">
					<Skeleton className="h-4 w-8" />
					<Skeleton className="h-4 w-8" />
					<Skeleton className="h-4 w-8" />
				</div>
				<Skeleton className="h-5 w-16 rounded" />
			</div>
		</div>
	</div>
);

export const HotThreadsSkeleton = ({ count = 3 }: { count?: number }) => (
	<div className="space-y-1">
		{Array.from({ length: count }).map((_, i) => (
			<div key={i} className="px-1 py-1.5">
				<HotThreadItemSkeleton />
			</div>
		))}
	</div>
);
