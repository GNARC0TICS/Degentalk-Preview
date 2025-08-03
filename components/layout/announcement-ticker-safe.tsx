import { memo } from 'react';
import { Megaphone } from 'lucide-react';
import { announcementQuotes } from '@/config/announcement-quotes';

// Get a deterministic selection of quotes based on the current day
function getDeterministicQuotes() {
	const now = new Date();
	const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
	const startIndex = dayOfYear % announcementQuotes.length;
	
	// Create a deterministic selection by rotating through the array
	const selected = [];
	for (let i = 0; i < 8; i++) {
		selected.push(announcementQuotes[(startIndex + i * 3) % announcementQuotes.length]);
	}
	return selected;
}

// Server-safe announcement ticker with no hydration issues
export const AnnouncementTickerSafe = memo(function AnnouncementTickerSafe() {
	// Use deterministic quotes to avoid hydration mismatch
	const announcements = getDeterministicQuotes();

	return (
		<div 
			className="bg-zinc-900/80 border-y border-zinc-800 h-10 relative overflow-hidden"
			role="region"
			aria-label="Site announcements"
			aria-live="off"
		>
			{/* Static icon container with solid background */}
			<div className="absolute left-0 top-0 h-full flex items-center px-4 bg-zinc-900 z-20">
				<Megaphone className="w-4 h-4 text-emerald-400" aria-hidden="true" />
			</div>

			{/* Enhanced left fade overlay */}
			<div className="absolute inset-y-0 left-12 w-12 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent z-10 pointer-events-none" />

			{/* Enhanced right fade overlay */}
			<div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-900 via-zinc-900/80 to-transparent z-10 pointer-events-none" />

			{/* Scrolling text container with CSS-only animation */}
			<div className="h-full ml-14 mr-4" role="marquee" aria-label="Scrolling announcements">
				<div className="ticker-scroll-container h-full">
					<div className="ticker-scroll-content">
						{/* Triple the content for seamless scrolling */}
						{[...announcements, ...announcements, ...announcements].map((announcement, index) => (
							<span key={`ann-${index}`} className="ticker-item">
								<span data-announcement-type={announcement.type}>
									{announcement.content}
								</span>
								{index % announcements.length !== announcements.length - 1 && (
									<span className="ticker-separator" aria-hidden="true">—</span>
								)}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* CSS-in-JS alternative using CSS modules or global styles to avoid hydration issues */}
			<style jsx>{`
				.ticker-scroll-container {
					display: flex;
					align-items: center;
					height: 100%;
				}

				.ticker-scroll-content {
					display: flex;
					align-items: center;
					white-space: nowrap;
					animation: ticker-scroll-safe 20s linear infinite;
					will-change: transform;
					backface-visibility: hidden;
					-webkit-backface-visibility: hidden;
					transform: translateZ(0);
					-webkit-transform: translateZ(0);
				}

				@keyframes ticker-scroll-safe {
					0% { transform: translateX(0); }
					100% { transform: translateX(-33.33%); }
				}

				.ticker-scroll-content:hover {
					animation-play-state: paused;
				}

				.ticker-item {
					display: inline-flex;
					align-items: center;
					padding: 0 2rem;
					font-size: 0.875rem;
					line-height: 1.2;
					color: #e5e7eb;
					font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
					letter-spacing: -0.02em;
				}

				.ticker-separator {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					color: #6b7280;
					margin: 0 1.5rem;
					opacity: 0.5;
					font-size: 0.875rem;
					user-select: none;
				}

				@media (prefers-reduced-motion: reduce) {
					.ticker-scroll-content {
						animation-duration: 40s;
					}
				}

				@media (max-width: 640px) {
					.ticker-item {
						font-size: 0.75rem;
						padding: 0 1.5rem;
					}
					.ticker-separator {
						margin: 0 1rem;
					}
				}
			`}</style>
		</div>
	);
});