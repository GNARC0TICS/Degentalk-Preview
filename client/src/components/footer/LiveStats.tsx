import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Zap, Smartphone } from 'lucide-react';

interface LiveStatsData {
	degensOnline: number;
	shitpostsLogged: number;
	tipsFired: number;
}

export function LiveStats() {
	const [stats, setStats] = useState<LiveStatsData>({
		degensOnline: 237,
		shitpostsLogged: 42069,
		tipsFired: 1337
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

	const statsConfig = [
		{
			icon: Users,
			label: 'Degens Online',
			value: stats.degensOnline,
			color: 'emerald',
			pulse: true,
			tooltip: 'Active users right now (probably losing money)'
		},
		{
			icon: Smartphone,
			label: 'Shitposts Logged',
			value: stats.shitpostsLogged,
			color: 'purple',
			pulse: false,
			tooltip: 'Total posts made on mobile (for maximum chaos)'
		},
		{
			icon: Zap,
			label: 'Tips Fired',
			value: stats.tipsFired,
			color: 'amber',
			pulse: false,
			tooltip: 'Total DGT sent all-time (probably regretted)'
		}
	];

	return (
		<div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8 text-sm">
			{statsConfig.map((stat, index) => {
				const IconComponent = stat.icon;
				const colorClasses = {
					emerald: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
					purple: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
					amber: 'text-amber-400 border-amber-400/20 bg-amber-400/5'
				};

				return (
					<div
						key={stat.label}
						className={`group relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg border backdrop-blur-sm cursor-help transition-all duration-300 hover:scale-105 ${
							colorClasses[stat.color as keyof typeof colorClasses]
						}`}
						title={stat.tooltip}
					>
						{/* Pulsing dot for online users */}
						{stat.pulse && (
							<div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
						)}

						<IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />

						<div className="flex flex-col items-start">
							<span className="font-bold text-base sm:text-lg leading-none">
								{formatNumber(stat.value)}
							</span>
							<span className="text-xs opacity-80 leading-none mt-0.5 hidden sm:block">
								{stat.label}
							</span>
							<span className="text-xs opacity-80 leading-none mt-0.5 sm:hidden">
								{stat.label.split(' ')[0]}
							</span>
						</div>

						{/* Hover tooltip */}
						<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-800 text-zinc-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
							{stat.tooltip}
							<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
						</div>
					</div>
				);
			})}
		</div>
	);
}
