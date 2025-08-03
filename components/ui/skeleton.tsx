import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	pulse?: boolean;
}

function Skeleton({ className, pulse = true, ...props }: SkeletonProps) {
	return (
		<div 
			className={cn(
				'rounded-md bg-zinc-800/50',
				pulse && 'animate-pulse',
				className
			)} 
			{...props} 
		/>
	);
}

export function BannerSkeleton() {
	return (
		<div className="relative h-[200px] md:h-[250px] lg:h-[300px] rounded-lg overflow-hidden">
			<Skeleton className="absolute inset-0" />
			<div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end space-y-4">
				<Skeleton className="h-8 w-2/3 bg-zinc-700/50" />
				<Skeleton className="h-4 w-1/2 bg-zinc-700/50" />
				<Skeleton className="h-10 w-32 bg-zinc-700/50 rounded-md" />
			</div>
		</div>
	);
}

export { Skeleton };
