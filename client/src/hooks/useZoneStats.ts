import { useQueries } from '@tanstack/react-query';
import { apiRequest } from '@utils/api-request';

export interface ZoneStats {
	todaysPosts: number;
	trendingThreads: number;
	lastActiveUser?: {
		username: string;
		avatarUrl?: string;
	};
	daysOld: number;
}

interface ZoneStatsApiResponse {
	todaysPosts: number;
	trendingThreads: number;
	lastActiveUser?: {
		username: string;
		avatarUrl?: string;
	};
	createdAt?: string;
}

function transform(api: ZoneStatsApiResponse): ZoneStats {
	const daysOld = api.createdAt
		? Math.max(1, Math.floor((Date.now() - new Date(api.createdAt).getTime()) / 86_400_000))
		: 1;
	return {
		todaysPosts: api.todaysPosts ?? 0,
		trendingThreads: api.trendingThreads ?? 0,
		lastActiveUser: api.lastActiveUser,
		daysOld
	};
}

export function useZoneStatsMap(slugs: string[]) {
	const results = useQueries({
		queries: slugs.map((slug) => ({
			queryKey: ['zoneStats', slug],
			queryFn: async () => {
				const data = await apiRequest<ZoneStatsApiResponse>({
					url: `/api/forum/zone-stats?slug=${slug}`
				});
				return transform(data);
			},
			staleTime: 60_000,
			refetchInterval: 180_000
		}))
	});

	const map: Record<string, ZoneStats> = {};
	results.forEach((q, idx) => {
		if (q.data) map[slugs[idx]] = q.data;
	});
	return map;
}
