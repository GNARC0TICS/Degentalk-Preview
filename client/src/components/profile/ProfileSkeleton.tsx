import React from 'react';
import { Skeleton } from '@app/components/ui/skeleton';

/**
 * Profile page loading skeleton
 * Shows a placeholder loading state while profile data is being fetched
 */
export function ProfileSkeleton() {
	return (
		<div className="container max-w-screen-xl mx-auto p-4">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Sidebar skeleton */}
				<div className="col-span-1">
					<div className="bg-black rounded-lg overflow-hidden shadow-md border-2 border-zinc-800 p-6">
						<div className="flex flex-col items-center">
							{/* Avatar skeleton */}
							<Skeleton className="h-24 w-24 rounded-full mb-4" />

							{/* Username skeleton */}
							<Skeleton className="h-6 w-32 mb-2" />

							{/* Role badge skeleton */}
							<Skeleton className="h-5 w-16 rounded-full mb-4" />

							{/* Stats skeletons */}
							<div className="w-full space-y-2 mb-4">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-5/6" />
							</div>

							{/* Button skeletons */}
							<div className="w-full space-y-2">
								<Skeleton className="h-9 w-full rounded-md" />
								<Skeleton className="h-9 w-full rounded-md" />
							</div>
						</div>
					</div>
				</div>

				{/* Main content skeleton */}
				<div className="col-span-1 lg:col-span-3">
					{/* Tabs skeleton */}
					<div className="grid grid-cols-4 gap-2 mb-6">
						{Array(4)
							.fill(0)
							.map((_, i) => (
								<Skeleton key={i} className="h-10 rounded-md" />
							))}
					</div>

					{/* Content skeletons */}
					<div className="space-y-6">
						{/* Stats row */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{Array(4)
								.fill(0)
								.map((_, i) => (
									<Skeleton key={i} className="h-24 rounded-lg" />
								))}
						</div>

						{/* Content blocks */}
						<Skeleton className="h-40 w-full rounded-lg" />
						<Skeleton className="h-60 w-full rounded-lg" />
						<Skeleton className="h-40 w-full rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProfileSkeleton;
