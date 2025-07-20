/**
 * System Analytics Hooks
 *
 * React Query hooks for system analytics data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	systemAnalyticsApi,
	type SystemMetricsParams,
	type PerformanceHeatmapParams,
	type SystemHealthParams,
	type RealtimeAnalyticsParams,
	type CacheOperationParams
} from '../api/system-analytics.api.ts';
import { toast } from 'sonner';

// ============ QUERY KEYS ============

export const systemAnalyticsKeys = {
	all: ['system-analytics'] as const,
	metrics: (params?: SystemMetricsParams) =>
		[...systemAnalyticsKeys.all, 'metrics', params] as const,
	overview: () => [...systemAnalyticsKeys.all, 'overview'] as const,
	heatmap: (params?: PerformanceHeatmapParams) =>
		[...systemAnalyticsKeys.all, 'heatmap', params] as const,
	health: (params?: SystemHealthParams) => [...systemAnalyticsKeys.all, 'health', params] as const,
	realtime: (params?: RealtimeAnalyticsParams) =>
		[...systemAnalyticsKeys.all, 'realtime', params] as const,
	cache: () => [...systemAnalyticsKeys.all, 'cache'] as const,
	database: () => [...systemAnalyticsKeys.all, 'database'] as const
};

// ============ SYSTEM METRICS HOOKS ============

export const useSystemMetrics = (params?: SystemMetricsParams) => {
	return useQuery({
		queryKey: systemAnalyticsKeys.metrics(params),
		queryFn: () => systemAnalyticsApi.getSystemMetrics(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});
};

export const useSystemOverview = () => {
	return useQuery({
		queryKey: systemAnalyticsKeys.overview(),
		queryFn: () => systemAnalyticsApi.getSystemOverview(),
		staleTime: 2 * 60 * 1000, // 2 minutes
		refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});
};

// ============ PERFORMANCE VISUALIZATION HOOKS ============

export const usePerformanceHeatmap = (params?: PerformanceHeatmapParams) => {
	return useQuery({
		queryKey: systemAnalyticsKeys.heatmap(params),
		queryFn: () => systemAnalyticsApi.getPerformanceHeatmap(params),
		staleTime: 10 * 60 * 1000, // 10 minutes
		refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});
};

// ============ SYSTEM HEALTH HOOKS ============

export const useSystemHealth = (params?: SystemHealthParams) => {
	return useQuery({
		queryKey: systemAnalyticsKeys.health(params),
		queryFn: () => systemAnalyticsApi.getSystemHealth(params),
		staleTime: 1 * 60 * 1000, // 1 minute
		refetchInterval: 1 * 60 * 1000, // Auto-refresh every minute
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});
};

// ============ REAL-TIME ANALYTICS HOOKS ============

export const useRealtimeAnalytics = (params?: RealtimeAnalyticsParams) => {
	return useQuery({
		queryKey: systemAnalyticsKeys.realtime(params),
		queryFn: () => systemAnalyticsApi.getRealtimeAnalytics(params),
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
	});
};

// ============ CACHE ANALYTICS HOOKS ============

export const useCacheStats = () => {
	return useQuery({
		queryKey: systemAnalyticsKeys.cache(),
		queryFn: () => systemAnalyticsApi.getCacheStats(),
		staleTime: 1 * 60 * 1000, // 1 minute
		refetchInterval: 1 * 60 * 1000, // Auto-refresh every minute
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});
};

export const useCacheOperation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (operation: CacheOperationParams) =>
			systemAnalyticsApi.performCacheOperation(operation),
		onSuccess: (data, variables) => {
			// Invalidate cache-related queries
			queryClient.invalidateQueries({ queryKey: systemAnalyticsKeys.cache() });
			queryClient.invalidateQueries({ queryKey: systemAnalyticsKeys.metrics() });
			queryClient.invalidateQueries({ queryKey: systemAnalyticsKeys.overview() });

			// Show success toast
			const operationName =
				variables.operation.charAt(0).toUpperCase() + variables.operation.slice(1);
			toast.success(`Cache ${operationName} Operation Completed`, {
				description: `Successfully performed ${variables.operation} operation`
			});
		},
		onError: (error: unknown) => {
			toast.error('Cache Operation Failed', {
				description: (error as Error)?.message || 'Failed to perform cache operation'
			});
		}
	});
};

// ============ DATABASE ANALYTICS HOOKS ============

export const useDatabaseStats = () => {
	return useQuery({
		queryKey: systemAnalyticsKeys.database(),
		queryFn: () => systemAnalyticsApi.getDatabaseStats(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});
};

// ============ UTILITY HOOKS ============

/**
 * Force refresh all system analytics data
 */
export const useRefreshSystemAnalytics = () => {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: systemAnalyticsKeys.all });
		toast.success('System Analytics Refreshed', {
			description: 'All analytics data has been refreshed'
		});
	};
};

/**
 * Get loading state for all critical system metrics
 */
export const useSystemAnalyticsLoadingState = () => {
	const { isLoading: overviewLoading } = useSystemOverview();
	const { isLoading: healthLoading } = useSystemHealth();
	const { isLoading: realtimeLoading } = useRealtimeAnalytics();

	return {
		isLoading: overviewLoading || healthLoading || realtimeLoading,
		overviewLoading,
		healthLoading,
		realtimeLoading
	};
};

/**
 * Get error state for all system analytics
 */
export const useSystemAnalyticsErrorState = () => {
	const { error: overviewError } = useSystemOverview();
	const { error: healthError } = useSystemHealth();
	const { error: realtimeError } = useRealtimeAnalytics();
	const { error: cacheError } = useCacheStats();

	const hasErrors = Boolean(overviewError || healthError || realtimeError || cacheError);
	const errorMessages = [overviewError, healthError, realtimeError, cacheError]
		.filter(Boolean)
		.map((error) => error?.message || 'Unknown error');

	return {
		hasErrors,
		errorMessages,
		overviewError,
		healthError,
		realtimeError,
		cacheError
	};
};
