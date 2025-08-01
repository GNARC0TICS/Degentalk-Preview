import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { NavLink } from './NavLink';
import { primaryNavigation } from '@/config/navigation';

// Memoize path generation to prevent recalculation
const generateRandomPath = (isWide = false) => {
	const width = isWide ? 100 : 70;
	const startX = 5;
	const endX = width - 5;
	const centerY = 10;
	const startY = centerY + (Math.random() - 0.5) * 3;
	const numPoints = 2;
	const section = (endX - startX) / (numPoints + 1);
	const points: { x: number; y: number }[] = [];

	for (let i = 1; i <= numPoints; i++) {
		const x = startX + section * i + (Math.random() - 0.5) * section * 0.2;
		const y = centerY + (Math.random() - 0.5) * 3;
		points.push({ x, y });
	}

	points.push({ x: endX, y: centerY + (Math.random() - 0.5) * 3 });

	let path = `M${startX} ${startY}`;
	points.forEach((point, i) => {
		const prev = i === 0 ? { x: startX, y: startY } : points[i - 1];
		const controlX = prev.x + (point.x - prev.x) / 2;
		const controlY = prev.y + (Math.random() - 0.5) * 2;
		path += ` Q${controlX} ${controlY}, ${point.x} ${point.y}`;
	});

	return path;
};

interface PrimaryNavProps {
	className?: string;
}

export function PrimaryNavOptimized({ className }: PrimaryNavProps) {
	const location = useLocation();
	const navRefs = useRef<(SVGPathElement | null)[]>([]);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	
	// Generate paths only once on mount
	const navPaths = useMemo(() => {
		return primaryNavigation.map((item) => {
			const isLeaderboard = item.label === 'Leaderboard';
			return generateRandomPath(isLeaderboard);
		});
	}, []);

	// Cleanup function
	useEffect(() => {
		return () => {
			// Clean up GSAP animations on unmount
			if (timelineRef.current) {
				timelineRef.current.kill();
			}
			navRefs.current.forEach(path => {
				if (path) gsap.killTweensOf(path);
			});
		};
	}, []);

	// Initialize paths
	useEffect(() => {
		navRefs.current = [];
		
		// Create a timeline for coordinated animations
		const tl = gsap.timeline();
		timelineRef.current = tl;

		navRefs.current.forEach((path, index) => {
			if (path && primaryNavigation[index]) {
				const pathLength = path.getTotalLength();
				const isActive = primaryNavigation[index].href === location.pathname;
				const item = primaryNavigation[index];
				const isComingSoon = ['Forum', 'Shop', 'Leaderboard'].includes(item.label);
				
				// Set initial state
				gsap.set(path, {
					strokeDasharray: pathLength,
					strokeDashoffset: isComingSoon || isActive ? 0 : pathLength,
					opacity: isComingSoon || isActive ? 1 : 0
				});
			}
		});
	}, [location.pathname, navPaths]);

	const handleMouseEnter = (index: number) => {
		const path = navRefs.current[index];
		const item = primaryNavigation[index];
		const isComingSoon = ['Forum', 'Shop', 'Leaderboard'].includes(item.label);
		
		if (path && !isComingSoon && item.href !== location.pathname) {
			gsap.to(path, {
				strokeDashoffset: 0,
				opacity: 1,
				duration: 0.3,
				ease: 'power2.out',
				overwrite: 'auto' // Prevent animation conflicts
			});
		}
	};

	const handleMouseLeave = (index: number) => {
		const path = navRefs.current[index];
		const item = primaryNavigation[index];
		const isComingSoon = ['Forum', 'Shop', 'Leaderboard'].includes(item.label);
		
		if (path && !isComingSoon && item.href !== location.pathname) {
			const pathLength = path.getTotalLength();
			gsap.to(path, {
				strokeDashoffset: pathLength,
				opacity: 0,
				duration: 0.2,
				ease: 'power1.in',
				overwrite: 'auto'
			});
		}
	};

	return (
		<nav className={`hidden md:flex items-center space-x-1 ${className || ''}`} role="navigation" aria-label="Primary navigation">
			{primaryNavigation.map((item, index) => {
				const isActive = item.href === location.pathname;
				const isLeaderboard = item.label === 'Leaderboard';
				const isComingSoon = ['Forum', 'Shop', 'Leaderboard'].includes(item.label);
				const viewBoxWidth = isLeaderboard ? 100 : 70;
				const svgPath = navPaths[index];
				
				return (
					<NavLink
						key={item.label}
						href={item.href}
						prefetch={item.prefetch}
						analyticsLabel={item.analyticsLabel}
						aria-label={`Navigate to ${item.label}${isComingSoon ? ' (Coming Soon)' : ''}`}
						disabled={isComingSoon}
					>
						<div
							className={`nav-item group px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
								isComingSoon 
									? 'text-zinc-500 cursor-not-allowed opacity-60' 
									: isActive 
										? 'text-white nav-active' 
										: 'text-zinc-300 hover:text-emerald-400'
							}`}
							onMouseEnter={() => !isComingSoon && handleMouseEnter(index)}
							onMouseLeave={() => !isComingSoon && handleMouseLeave(index)}
						>
							<span className="relative z-10">{item.label}</span>
							{/* Strikethrough for coming soon items */}
							{isComingSoon && (
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
									<div className="w-full h-[2px] bg-zinc-600 transform rotate-[-8deg]" />
								</div>
							)}
							{/* SVG underline with randomized path */}
							<svg
								className="underline-svg w-full"
								viewBox={`0 0 ${viewBoxWidth} 20`}
								fill="none"
								preserveAspectRatio="none"
								style={{ overflow: 'visible' }}
								aria-hidden="true"
							>
								<path
									ref={(el) => {
										navRefs.current[index] = el;
									}}
									className="nav-underline"
									d={svgPath}
									stroke={isComingSoon ? '#e55050' : '#10b981'}
									strokeWidth="3"
									strokeLinecap="round"
								/>
							</svg>
						</div>
					</NavLink>
				);
			})}
		</nav>
	);
}