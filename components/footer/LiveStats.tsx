'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { trackAnalyticsMilestone, trackSocialProofView } from '@/lib/analytics';
import { logger } from '@/lib/logger';

interface LiveStatsData {
	pageVisits: number;
	waitlistSignups: number;
	currentVisitors: number;
}

export function LiveStats() {
	// Start with realistic initial values
	const [stats, setStats] = useState<LiveStatsData>({
		pageVisits: 3847,
		waitlistSignups: 134,
		currentVisitors: 12
	});
	
	const [hasTrackedView, setHasTrackedView] = useState(false);

	// Fetch live stats from API
	const fetchStats = useCallback(async () => {
		try {
			const response = await fetch('/api/visitors');
			if (response.ok) {
				const data = await response.json();
				setStats(data);
				
				// Track milestones
				if (data.pageVisits === 5000 || data.pageVisits === 10000) {
					trackAnalyticsMilestone(data.pageVisits, { 
						totalVisitors: data.pageVisits,
						timeToReach: Date.now() - performance.timing.navigationStart
					});
				}
			}
		} catch (error) {
			logger.error('LiveStats', 'Failed to fetch visitor stats', error as Error);
		}
	}, []);

	// Track social proof view when component mounts
	useEffect(() => {
		if (!hasTrackedView) {
			trackSocialProofView('footer', stats.pageVisits);
			setHasTrackedView(true);
		}
	}, [hasTrackedView, stats.pageVisits]);

	// Poll API for updates
	useEffect(() => {
		// Initial fetch
		fetchStats();

		// Poll every 60 seconds (more reasonable for a waitlist)
		const interval = setInterval(fetchStats, 60000);

		return () => {
			clearInterval(interval);
		};
	}, [fetchStats]);

	const formatNumber = (num: number): string => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toLocaleString();
	};

	return (
		<div className="border-b border-zinc-800 pb-4 mb-8">
			<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base">
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
					<span className="text-zinc-500 font-display uppercase tracking-wide">
						{formatNumber(stats.currentVisitors)} Lurking
					</span>
				</div>
				<div className="text-zinc-600">•</div>
				<div className="text-zinc-500 font-display uppercase tracking-wide">
					{formatNumber(stats.pageVisits)} Visits
				</div>
				<div className="text-zinc-600">•</div>
				<div className="text-zinc-500 font-display uppercase tracking-wide">
					{formatNumber(stats.waitlistSignups)} Joined
				</div>
			</div>
		</div>
	);
}
