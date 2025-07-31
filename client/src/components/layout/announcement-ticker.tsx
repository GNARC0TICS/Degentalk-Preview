import React from 'react';
import { Megaphone } from 'lucide-react';

export function AnnouncementTicker() {
	const announcements = [
		{
			id: '1',
			content: '🚀 Welcome to Degentalk! The premier crypto community forum',
		},
		{
			id: '2',
			content: '💎 Diamond hands only! HODL through the storm',
		},
		{
			id: '3',
			content: '🔥 Hot topics: Memecoin season is back!',
		},
		{
			id: '4',
			content: '🎯 Join the conversation and earn XP',
		}
	];

	return (
		<div className="bg-zinc-900/80 border-y border-zinc-800 h-10 relative overflow-hidden">
			{/* Static icon container */}
			<div className="absolute left-0 top-0 h-full flex items-center px-4 bg-zinc-900/80 z-10">
				<Megaphone className="w-4 h-4 text-emerald-400" />
			</div>

			{/* Left fade overlay */}
			<div className="absolute inset-y-0 left-12 w-12 bg-gradient-to-r from-zinc-900/80 to-transparent z-[5]" />

			{/* Right fade overlay */}
			<div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-900/60 to-transparent z-[5]" />

			{/* Scrolling text container */}
			<div className="h-full ml-16">
					<style>{`
						@keyframes ticker-scroll {
							0% { transform: translateX(0); }
							100% { transform: translateX(-33.33%); }
						}
						.ticker-content {
							display: flex;
							align-items: center;
							height: 100%;
							animation: ticker-scroll 30s linear infinite !important;
							animation-duration: 30s !important;
							white-space: nowrap;
						}
						.ticker-content:hover {
							animation-play-state: paused !important;
						}
						.ticker-item {
							display: inline-flex;
							align-items: center;
							height: 100%;
							padding: 0 3rem;
							font-size: 0.875rem;
							line-height: 1;
							color: #e5e7eb;
							white-space: nowrap;
						}
						/* Override any reduced motion settings for this ticker */
						@media (prefers-reduced-motion: reduce) {
							.ticker-content {
								animation: ticker-scroll 30s linear infinite !important;
								animation-duration: 30s !important;
							}
						}
					`}</style>
					<div className="ticker-content">
						{/* Triple the content for seamless scrolling */}
						{[...announcements, ...announcements, ...announcements].map((announcement, index) => (
							<span key={`ann-${index}`} className="ticker-item">
								{announcement.content}
							</span>
						))}
					</div>
			</div>
		</div>
	);
}