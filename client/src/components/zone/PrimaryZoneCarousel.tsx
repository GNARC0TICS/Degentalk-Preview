import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZoneCard, type ZoneCardProps } from '@/components/forum/ZoneCard';
import { cn } from '@/utils/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import './PrimaryZoneCarousel.css';

// Content type for future extensibility (ads, promotions, etc.)
export type CarouselContent = 
	| { type: 'zone'; data: ZoneCardProps['zone'] }
	| { type: 'ad'; data: { id: string; imageUrl: string; link: string; altText: string } };

export interface PrimaryZoneCarouselProps {
	zones: ZoneCardProps['zone'][];
	autoRotateMs?: number;
	className?: string;
	onZoneClick?: (zoneId: string) => void;
	// Future: content?: CarouselContent[] to support mixed content
}

interface CarouselState {
	currentIndex: number;
	isPlaying: boolean;
	direction: 'left' | 'right';
}

const PrimaryZoneCarousel = memo(
	({ zones, autoRotateMs = 8000, className, onZoneClick }: PrimaryZoneCarouselProps) => {
		const [state, setState] = useState<CarouselState>({
			currentIndex: 0,
			isPlaying: true,
			direction: 'right'
		});

		const [isHovered, setIsHovered] = useState(false);
		const intervalRef = useRef<NodeJS.Timeout>();

		// Wait for hydration before reading media queries to avoid SSR mismatch
		const [isMounted, setIsMounted] = useState(false);
		useEffect(() => {
			setIsMounted(true);
		}, []);

		const breakpoint = useBreakpoint();

		// Responsive cards per view – fallback to 1 until mounted
		const cardsPerView = React.useMemo(() => {
			if (!isMounted) return 1;
			// Mobile: 1, Tablet & Desktop: 2 (better for constrained width)
			return breakpoint.isMobile ? 1 : 2;
		}, [isMounted, breakpoint]);

		// Ensure currentIndex never exceeds the new maxIndex (handles viewport resize)
		useEffect(() => {
			setState((prev) => {
				const newMax = Math.max(0, zones.length - cardsPerView);
				return prev.currentIndex > newMax ? { ...prev, currentIndex: newMax } : prev;
			});
		}, [cardsPerView, zones.length]);

		// Calculate number of pages for dot indicators
		const numPages = Math.ceil(zones.length / cardsPerView);
		const maxIndex = Math.max(0, numPages - 1);

		// Auto-rotation effect
		useEffect(() => {
			if (!state.isPlaying || isHovered || zones.length <= cardsPerView) {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
				return;
			}

			intervalRef.current = setInterval(() => {
				setState((prev) => ({
					...prev,
					currentIndex: prev.currentIndex >= maxIndex ? 0 : prev.currentIndex + 1,
					direction: 'right'
				}));
			}, autoRotateMs);

			return () => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}
			};
		}, [state.isPlaying, isHovered, autoRotateMs, maxIndex, zones.length, cardsPerView]);

		const handlePrevious = () => {
			setState((prev) => ({
				...prev,
				currentIndex: prev.currentIndex <= 0 ? maxIndex : prev.currentIndex - 1,
				direction: 'left'
			}));
		};

		const handleNext = () => {
			setState((prev) => ({
				...prev,
				currentIndex: prev.currentIndex >= maxIndex ? 0 : prev.currentIndex + 1,
				direction: 'right'
			}));
		};

		const togglePlayPause = () => {
			setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowLeft':
					e.preventDefault();
					handlePrevious();
					break;
				case 'ArrowRight':
					e.preventDefault();
					handleNext();
					break;
				case ' ':
					e.preventDefault();
					togglePlayPause();
					break;
			}
		};

		const handleZoneEnter = (zoneId: string) => {
			onZoneClick?.(zoneId);
		};

		// Animation variants
		const containerVariants = {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					staggerChildren: 0.1,
					delayChildren: 0.2
				}
			}
		};

		const cardVariants = {
			hidden: { opacity: 0, y: 20 },
			visible: { opacity: 1, y: 0 },
			exit: { opacity: 0, y: -20 }
		};

		if (!zones || zones.length === 0) {
			return null;
		}

		// If we have fewer zones than cards per view, show them all statically
		if (zones.length <= cardsPerView) {
			return (
				<section className={cn('py-8', className)} role="region" aria-label="Primary Zones">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-white mb-2">Primary Zones</h2>
								<p className="text-zinc-400">Jump into the action</p>
							</div>
						</div>
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className={cn(
								'grid gap-4',
								zones.length === 1 && 'grid-cols-1 max-w-lg mx-auto',
								zones.length >= 2 && 'grid-cols-1 md:grid-cols-2'
							)}
						>
							{zones.map((zone) => (
								<motion.div key={zone.id} variants={cardVariants}>
									<ZoneCard zone={zone} layout="compact" onEnter={handleZoneEnter} className="w-full" />
								</motion.div>
							))}
						</motion.div>
					</div>
				</section>
			);
		}

		return (
			<section
				className={cn('py-8', className)}
				role="region"
				aria-label="Primary Zones Carousel"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onKeyDown={handleKeyDown}
				tabIndex={0}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<span className="sr-only" aria-live="polite">
						Slide {state.currentIndex + 1} of {zones.length}
					</span>

					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-2xl font-bold text-white mb-2">Primary Zones</h2>
							<p className="text-zinc-400">Jump into the action</p>
						</div>

						{/* Controls */}
						<div className="flex items-center gap-2">
							{/* Play/Pause Button */}
							<Button
								variant="ghost"
								size="icon"
								onClick={togglePlayPause}
								className="text-zinc-400 hover:text-white h-10 w-10"
								aria-label={state.isPlaying ? 'Pause carousel' : 'Play carousel'}
							>
								{state.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
							</Button>

							{/* Navigation Buttons */}
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevious}
								className="text-zinc-400 hover:text-white h-10 w-10"
								aria-label="Previous zones"
							>
								<ChevronLeft className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleNext}
								className="text-zinc-400 hover:text-white h-10 w-10"
								aria-label="Next zones"
							>
								<ChevronRight className="h-5 w-5" />
							</Button>
						</div>
					</div>

					{/* Carousel Container */}
					<div className="zone-carousel-container relative overflow-x-hidden w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<motion.div
							className="flex"
							animate={{ x: `-${state.currentIndex * 100}%` }}
							transition={{ duration: 0.5, ease: 'easeInOut' }}
							style={{ width: '100%' }}
						>
							{zones.map((zone, index) => (
								<div
									key={zone.id}
									className="zone-carousel-item flex-shrink-0 px-2"
									style={{
										flex: `0 0 calc(100% / ${cardsPerView})`,
										maxWidth: `calc(100% / ${cardsPerView})`
									}}
								>
									{/* Future: Replace with content renderer that handles both zones and ads
									    Example:
									    {content.type === 'zone' ? (
									      <ZoneCard zone={content.data} ... />
									    ) : (
									      <AdCard ad={content.data} ... />
									    )}
									*/}
									<ZoneCard
										zone={zone}
										layout="compact"
										onEnter={handleZoneEnter}
										className="w-full transition-opacity duration-300"
									/>
								</div>
							))}
						</motion.div>
					</div>

					{/* Indicators */}
					<div className="flex justify-center mt-6 gap-2">
						{Array.from({ length: numPages }).map((_, index) => (
							<button
								key={index}
								onClick={() =>
									setState((prev) => ({
										...prev,
										currentIndex: index,
										direction: index > prev.currentIndex ? 'right' : 'left'
									}))
								}
								className={cn(
									'w-2 h-2 rounded-full transition-colors duration-200',
									index === state.currentIndex ? 'bg-emerald-400' : 'bg-zinc-600 hover:bg-zinc-500'
								)}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>

					{/* Status for screen readers */}
					<div className="sr-only" aria-live="polite" aria-atomic="true">
						Showing zones {state.currentIndex + 1} to{' '}
						{Math.min(state.currentIndex + cardsPerView, zones.length)} of {zones.length}. Carousel
						is {state.isPlaying ? 'playing' : 'paused'}.
					</div>
				</div>
			</section>
		);
	}
);

PrimaryZoneCarousel.displayName = 'PrimaryZoneCarousel';

export default PrimaryZoneCarousel;
export { PrimaryZoneCarousel };
