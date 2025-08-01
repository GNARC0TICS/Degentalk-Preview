import React, { useState, useEffect } from 'react';
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

	// Track social proof view when component mounts
	useEffect(() => {
		if (!hasTrackedView) {
			trackSocialProofView('footer', stats.pageVisits);
			setHasTrackedView(true);
		}
	}, [hasTrackedView, stats.pageVisits]);

	// Simulate realistic live updates
	useEffect(() => {
		// Page visits update every 5-30 seconds
		const visitInterval = setInterval(() => {
			const rand = Math.random();
			if (rand > 0.7) { // 30% chance of new visit
				setStats((prev) => {
					const newVisits = prev.pageVisits + 1;
					
					// Track milestones
					if (newVisits === 5000 || newVisits === 10000) {
						trackAnalyticsMilestone(newVisits, { 
							totalVisitors: newVisits,
							timeToReach: Date.now() - performance.timing.navigationStart
						});
					}
					
					return { ...prev, pageVisits: newVisits };
				});
			}
		}, Math.random() * 25000 + 5000);

		// Current visitors fluctuate
		const currentVisitorInterval = setInterval(() => {
			setStats((prev) => ({
				...prev,
				currentVisitors: Math.max(3, Math.min(25, prev.currentVisitors + Math.floor(Math.random() * 5) - 2))
			}));
			
			// Track analytics interaction periodically
			if (Math.random() > 0.9) {
				trackAnalyticsInteraction('view', {
					totalVisitors: stats.pageVisits,
					currentVisitors: stats.currentVisitors,
					isUpdating: true
				});
			}
		}, 8000);

		// Waitlist signups occasionally
		const signupInterval = setInterval(() => {
			if (Math.random() > 0.95) { // 5% chance
				setStats((prev) => ({
					...prev,
					waitlistSignups: prev.waitlistSignups + 1
				}));
			}
		}, 10000);

		return () => {
			clearInterval(visitInterval);
			clearInterval(currentVisitorInterval);
			clearInterval(signupInterval);
		};
	}, [stats.pageVisits, stats.currentVisitors]);

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
