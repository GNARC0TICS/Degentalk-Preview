import React, { useState, useEffect } from 'react';
import { AnimatedStatCard } from './AnimatedStatCard';

interface LiveStatsData {
	degensOnline: number;
	shitpostsLogged: number;
	tipsFired: number;
}

export function LiveStats() {
	const [stats, setStats] = useState<LiveStatsData>({
		degensOnline: 467,
		shitpostsLogged: 42500,
		tipsFired: 1500
	});

	// Simulate live stats updates (ready for WebSocket integration)
	useEffect(() => {
		const interval = setInterval(() => {
			setStats((prev) => ({
				degensOnline: Math.max(50, prev.degensOnline + Math.floor(Math.random() * 10) - 4),
				shitpostsLogged: prev.shitpostsLogged + Math.floor(Math.random() * 3),
				tipsFired: prev.tipsFired + Math.floor(Math.random() * 2)
			}));
		}, 3000);

		return () => clearInterval(interval);
	}, []);

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
				value={formatNumber(stats.degensOnline)}
				label="Degens Online"
				variant="online"
				display="pill"
			/>
			<AnimatedStatCard
				value={formatNumber(stats.shitpostsLogged)}
				label="Shitposts"
				variant="posts"
				display="pill"
			/>
			<AnimatedStatCard
				value={formatNumber(stats.tipsFired)}
				label="Tips Sent (USD)"
				variant="tips"
				display="pill"
			/>
		</div>
	);
}
