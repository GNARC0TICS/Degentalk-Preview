'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@/lib/router-compat';
import gsap from 'gsap';
import { NavLink } from './NavLink';
import { primaryNavigation } from '@/config/navigation';

// Static handwritten-style paths for coming soon items
const HANDWRITTEN_PATHS = {
	Forum: 'M5 12 Q12 9 20 11 T30 10 Q38 12 45 10',
	Shop: 'M5 11 Q15 8 25 11 T35 9',
	Leaderboard: 'M5 10 Q20 13 35 9 T50 12 Q65 8 80 11 T95 10'
};

// Function to generate random underline paths (from original header)
const generateRandomPath = (isWide = false) => {
	const width = isWide ? 100 : 70; // Shorter for regular buttons, wider for Leaderboard
	const startX = 5; // Start further from edge
	const endX = width - 5; // End further from edge
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
	orientation?: 'horizontal' | 'vertical';
	showOnMobile?: boolean;
}

export function PrimaryNav({ className, orientation = 'horizontal', showOnMobile = false }: PrimaryNavProps) {
	const location = useLocation();
	const [navPaths, setNavPaths] = useState<string[]>([]);
	const navRefs = useRef<(SVGPathElement | null)[]>([]);
	// For static landing page - no authentication needed
	const visibleNavigation = primaryNavigation;

	// Generate paths on client side only (SSR-safe)
	useEffect(() => {
		// Only generate paths on client to avoid hydration mismatch
		if (typeof window !== 'undefined') {
			const paths = visibleNavigation.map((item) => {
				// Use static handwritten paths for coming soon items
				if (HANDWRITTEN_PATHS[item.label as keyof typeof HANDWRITTEN_PATHS]) {
					return HANDWRITTEN_PATHS[item.label as keyof typeof HANDWRITTEN_PATHS];
				}
				const isLeaderboard = item.label === 'Leaderboard';
				return generateRandomPath(isLeaderboard);
			});
			setNavPaths(paths);
		}
	}, []);

	// Initial setup without animation
	useEffect(() => {
		if (navPaths.length === 0) return;
		
		// Set initial state on first render
		navRefs.current.forEach((path, index) => {
			if (path && visibleNavigation[index]) {
				const pathLength = path.getTotalLength();
				const isActive = visibleNavigation[index].href === location.pathname;
				const isComingSoon = visibleNavigation[index].comingSoon ?? ['Forum', 'Shop', 'Leaderboard'].includes(visibleNavigation[index].label);
				
				if (isComingSoon) {
					// Coming soon items show static underline immediately
					gsap.set(path, {
						strokeDasharray: 'none',
						strokeDashoffset: 0,
						opacity: 1
					});
				} else {
					// Other items use animated underline
					gsap.set(path, {
						strokeDasharray: pathLength,
						strokeDashoffset: isActive ? 0 : pathLength,
						opacity: isActive ? 1 : 0
					});
				}
			}
		});
	}, [navPaths]); // Only run once when paths are generated

	// Set up GSAP animations when location changes
	useEffect(() => {
		// Create a timeline for smooth transitions
		const tl = gsap.timeline();
		
		// First, animate OUT any currently visible underlines (except coming soon items)
		navRefs.current.forEach((path, index) => {
			if (path && visibleNavigation[index]) {
				const isComingSoon = visibleNavigation[index].comingSoon ?? ['Forum', 'Shop', 'Leaderboard'].includes(visibleNavigation[index].label);
				const isActive = visibleNavigation[index].href === location.pathname;
				
				// If it's visible and not coming soon and not the new active item, animate it out
				if (!isComingSoon && !isActive) {
					const pathLength = path.getTotalLength();
					tl.to(path, {
						strokeDashoffset: pathLength,
						opacity: 0,
						duration: 0.2,
						ease: 'power2.in'
					}, 0); // Start at time 0
				}
			}
		});
		
		// Then animate IN the new active underline and coming soon items
		navRefs.current.forEach((path, index) => {
			if (path && visibleNavigation[index]) {
				const pathLength = path.getTotalLength();
				const isActive = visibleNavigation[index].href === location.pathname;
				const isComingSoon = visibleNavigation[index].comingSoon ?? ['Forum', 'Shop', 'Leaderboard'].includes(visibleNavigation[index].label);
				
				// Set initial state for all paths
				gsap.set(path, {
					strokeDasharray: pathLength
				});
				
				if (isComingSoon) {
					// Coming soon items always show underline (static, no animation)
					gsap.set(path, {
						strokeDashoffset: 0,
						opacity: 1
					});
				} else if (isActive) {
					// Animate in the active item with a staggered delay
					tl.to(path, {
						strokeDashoffset: 0,
						opacity: 1,
						duration: 0.4,
						ease: 'power2.out'
					}, 0.15); // Start after exit animations
				}
			}
		});
		
		return () => {
			// Cleanup on unmount
			tl.kill();
		};
	}, [location.pathname, navPaths]);


	const handleMouseEnter = (index: number) => {
		const path = navRefs.current[index];
		const isComingSoon = visibleNavigation[index].comingSoon ?? ['Forum', 'Shop', 'Leaderboard'].includes(visibleNavigation[index].label);
		
		// Skip hover effects for coming soon buttons (always show underline)
		if (path && !isComingSoon && visibleNavigation[index].href !== location.pathname) {
			gsap.killTweensOf(path);
			gsap.to(path, {
				strokeDashoffset: 0,
				opacity: 1,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	};

	const handleMouseLeave = (index: number) => {
		const path = navRefs.current[index];
		const isComingSoon = visibleNavigation[index].comingSoon ?? ['Forum', 'Shop', 'Leaderboard'].includes(visibleNavigation[index].label);
		
		// Skip hover effects for coming soon buttons (always show underline)
		if (path && !isComingSoon && visibleNavigation[index].href !== location.pathname) {
			const pathLength = path.getTotalLength();
			gsap.killTweensOf(path);
			gsap.to(path, {
				strokeDashoffset: pathLength,
				opacity: 0,
				duration: 0.2,
				ease: 'power1.in'
			});
		}
	};

	const navigationToRender = orientation === 'vertical' ? visibleNavigation.filter((it) => !(it.comingSoon ?? ['Forum','Shop','Leaderboard'].includes(it.label))) : visibleNavigation;

	return (
		<nav
		className={`${showOnMobile ? 'flex lg:hidden' : 'hidden lg:flex'} ${orientation === 'vertical' ? 'flex flex-col space-y-4' : 'flex items-center space-x-1'} ${className || ''}`}
	>
			{navigationToRender.map((item, index) => {
				// Determine base classes for item wrapper based on orientation
				const itemBase = orientation === 'vertical' ? 'w-full text-left py-3 text-lg' : 'px-3 py-2 text-sm';
				const isActive = item.href === location.pathname;
				const isComingSoon = item.comingSoon ?? ['Forum', 'Shop', 'Leaderboard'].includes(item.label);
				const isLeaderboard = item.label === 'Leaderboard';
				const viewBoxWidth = isLeaderboard ? 100 : 70;
				const defaultPath = isLeaderboard ? 'M5 10Q50 12 95 10' : 'M5 10Q35 12 65 10';
				
				// Ensure we have a valid path
				const svgPath = navPaths[index] || defaultPath;
				

				return (
					<NavLink
						key={item.label}
						href={item.href}
						prefetch={item.prefetch}
						analyticsLabel={item.analyticsLabel}
						aria-label={`Navigate to ${item.label}`}
						disabled={isComingSoon}
					>
						<div
							className={`nav-item group ${itemBase} rounded-md font-medium transition-all duration-200 relative ${
								isComingSoon 
									? 'text-zinc-500 cursor-not-allowed opacity-60' 
									: isActive 
										? 'text-white nav-active cursor-pointer' 
										: 'text-zinc-300 hover:text-emerald-400 cursor-pointer'
							}`}
							onMouseEnter={() => !isComingSoon && handleMouseEnter(index)}
							onMouseLeave={() => !isComingSoon && handleMouseLeave(index)}
							style={{ display: 'block' }}
						>
							<span className="relative">{item.label}</span>
							{/* Strikethrough for coming soon items */}
							{isComingSoon && (
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
									<div 
										className="w-full h-[3px] transform rotate-[-8deg] opacity-100" 
										style={{
											background: 'linear-gradient(90deg, transparent 0%, #ef4444 5%, #ef4444 95%, transparent 100%)',
											boxShadow: '0 1px 0 rgba(239, 68, 68, 0.3)',
											borderRadius: '1px'
										}}
									/>
								</div>
							)}
							{/* SVG underline with randomized path - only for non-coming-soon items */}
							{!isComingSoon && orientation === 'horizontal' && (
								<svg
									className="underline-svg w-full"
									viewBox={`0 0 ${viewBoxWidth} 20`}
									fill="none"
									preserveAspectRatio="none"
									style={{ overflow: 'visible' }}
								>
									<path
										ref={(el) => {
											if (navRefs.current) {
												navRefs.current[index] = el;
											}
										}}
										className="nav-underline"
										d={svgPath}
										stroke={isActive ? '#10b981' : '#10b981'}
										strokeWidth="3"
										strokeLinecap="round"
									/>
								</svg>
							)}
						</div>
					</NavLink>
				);
			})}
		</nav>
	);
}
