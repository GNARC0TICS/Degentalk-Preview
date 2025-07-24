import React from 'react';
import { Skeleton } from '@app/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@app/components/ui/card';
import { Loader2 } from 'lucide-react';

// Add stats data interface
interface StatsData {
	totalUsers: number;
	totalThreads: number;
	totalPosts: number;
	activeUsers24h: number;
	revenueDgt: number;
	[key: string]: number;
}

export default function StatsPage() {
	// Fetch stats via React Query
	const {
		data: statsData,
		isLoading,
		error
	} = useQuery<StatsData>({
		queryKey: ['/api/admin/stats'],
		queryFn: async () => {
			// Backend should return a JSON object with numeric metrics
			return apiRequest<StatsData>('/api/admin/stats', { method: 'GET' });
		}
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-1">Analytics</h1>
				<p className="text-muted-foreground">Key real-time metrics for your platform</p>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-32">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			) : error ? (
				<div className="text-red-500 text-center py-32">Failed to load stats.</div>
			) : statsData ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<StatsCard title="Users" value={statsData.totalUsers.toLocaleString()} />
					<StatsCard title="Threads" value={statsData.totalThreads.toLocaleString()} />
					<StatsCard title="Posts" value={statsData.totalPosts.toLocaleString()} />
					<StatsCard title="Active (24h)" value={statsData.activeUsers24h.toLocaleString()} />
					<StatsCard title="Revenue (DGT)" value={statsData.revenueDgt.toLocaleString()} />
				</div>
			) : (
				<div className="text-zinc-400 text-center py-32">No stats data available.</div>
			)}
		</div>
	);
}

function StatsCard({ title, value }: { title: string; value: string }) {
	return (
		<Card>
			<CardHeader>
				<CardDescription className="uppercase text-xs tracking-wide text-muted-foreground">
					{title}
				</CardDescription>
				<CardTitle className="text-4xl font-bold">{value}</CardTitle>
			</CardHeader>
			<CardContent />
		</Card>
	);
}
