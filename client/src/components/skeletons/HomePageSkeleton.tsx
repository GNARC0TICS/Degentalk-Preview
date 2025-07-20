import React from 'react';
import ZoneCardSkeleton from './ZoneCardSkeleton.tsx';

export default function HomePageSkeleton() {
	return (
		<div>
			{/* Hero Section placeholder */}
			<div className="h-64 bg-zinc-900 animate-pulse" />

			{/* Carousel placeholder */}
			<div className="py-8 container mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 3 }).map((_, idx) => (
						<ZoneCardSkeleton key={idx} />
					))}
				</div>
			</div>
		</div>
	);
}
