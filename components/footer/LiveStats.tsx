'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatedStatCard } from './AnimatedStatCard';
import { trackAnalyticsInteraction, trackAnalyticsMilestone, trackSocialProofView } from '@/lib/analytics';

interface LiveStatsData {
	pageVisits: number;
	waitlistSignups: number;
	currentVisitors: number;
}

export function LiveStats() {
	// Start with realistic initial values
	const [stats, setStats] = useState<LiveStatsData>({
		pageVisits: 3847,
		waitlistSignups: 742,
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
			console.error('Failed to fetch visitor stats:', error);
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

		// Poll every 10 seconds
		const interval = setInterval(fetchStats, 10000);

		// Track analytics interaction periodically
		const trackingInterval = setInterval(() => {
			if (Math.random() > 0.9) {
				trackAnalyticsInteraction('view', {
					totalVisitors: stats.pageVisits,
					currentVisitors: stats.currentVisitors,
					isUpdating: true
				});
			}
		}, 30000);

		return () => {
			clearInterval(interval);
			clearInterval(trackingInterval);
		};
	}, [fetchStats, stats.pageVisits, stats.currentVisitors]);

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
		<div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
			<AnimatedStatCard
				value={formatNumber(stats.pageVisits)}
				label="Page Visits"
				variant="online"
				display="pill"
			/>
			<AnimatedStatCard
				value={formatNumber(stats.waitlistSignups)}
				label="Waitlist Signups"
				variant="posts"
				display="pill"
			/>
			<AnimatedStatCard
				value={formatNumber(stats.currentVisitors)}
				label="Live Now"
				variant="tips"
				display="pill"
			/>
		</div>
	);
}
