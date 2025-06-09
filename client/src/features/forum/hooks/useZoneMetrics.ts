import { useQuery } from '@tanstack/react-query';

// React hook to fetch and provide live metrics for a forum zone in Degentalk™.
// Usage: const { data, isLoading, error } = useZoneMetrics(slug);

export interface ZoneMetrics {
  zoneId: number;
  threadCount: number;
  postCount: number;
  totalXp: number;
  totalDgt: number;
  activeUsers: number;
  hotThreads: Array<{
    id: number;
    title: string;
    replies: number;
    views: number;
    lastActivity: string;
  }>;
}

export function useZoneMetrics(slug: string) {
  return useQuery<ZoneMetrics>({
    queryKey: ['zone-metrics', slug],
    queryFn: async () => {
      const res = await fetch(`/api/zone/${slug}/metrics`);
      if (!res.ok) throw new Error('Failed to fetch zone metrics');
      return res.json();
    },
    enabled: !!slug,
    staleTime: 60 * 1000, // 1 minute
  });
} 