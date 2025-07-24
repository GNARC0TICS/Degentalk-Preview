import React from 'react';
import { Skeleton } from '@app/components/ui/skeleton';

export default function ZoneCardSkeleton() {
	return (
		<div className="relative overflow-hidden rounded-lg bg-zinc-800/40 p-4 animate-pulse">
			<Skeleton className="h-6 w-1/3 mb-2" />
			<Skeleton className="h-4 w-full mb-4" />
			<Skeleton className="h-32 w-full" />
		</div>
	);
}
