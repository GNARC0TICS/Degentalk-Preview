import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { NavLink } from './NavLink';
import { ForumNavButton } from './ForumNavButton';
import { primaryNavigation, filterNavItems } from '@/config/navigation';
import { useHeader } from './HeaderContext';

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
}

export function PrimaryNav({ className }: PrimaryNavProps) {
	const location = useLocation();
	const [navPaths, setNavPaths] = useState<string[]>([]);
	const navRefs = useRef<(SVGPathElement | null)[]>([]);
	const { authStatus, user } = useHeader();

	const isAuthenticated = authStatus !== 'guest' && authStatus !== 'loading';
	const userRoles = user?.isAdmin
		? (['admin', 'moderator', 'user'] as ('admin' | 'moderator' | 'user')[])
		: user?.isModerator
			? (['moderator', 'user'] as ('admin' | 'moderator' | 'user')[])
			: (['user'] as ('admin' | 'moderator' | 'user')[]);

	const visibleNavigation = filterNavItems(primaryNavigation, isAuthenticated, userRoles);

	// Generate random paths on component mount and set up GSAP animations
	useEffect(() => {
		const paths = visibleNavigation.map((item) => {
			const isLeaderboard = item.label === 'Leaderboard';
			return generateRandomPath(isLeaderboard);
		});
		setNavPaths(paths);
		navRefs.current = navRefs.current.slice(0, visibleNavigation.length);

		setTimeout(() => {
			navRefs.current.forEach((path, index) => {
				if (path) {
					const pathLength = path.getTotalLength();
					const isActive = visibleNavigation[index].href === location.pathname;
					gsap.set(path, {
						strokeDasharray: pathLength,
						strokeDashoffset: isActive ? 0 : pathLength,
						opacity: isActive ? 1 : 0
					});
				}
			});
		}, 100);
	}, [visibleNavigation.length, location.pathname]);

	const handleLocationChange = (currentLocation: string, isInitialSetup = false) => {
		navRefs.current.forEach((path, index) => {
			if (path) {
				const pathLength = path.getTotalLength();
				const isActive = visibleNavigation[index].href === currentLocation;

				gsap.killTweensOf(path);

				if (isActive) {
					gsap.to(path, {
						strokeDashoffset: 0,
						opacity: 1,
						duration: isInitialSetup ? 0.01 : 0.3,
						ease: 'power2.out'
					});
				} else {
					gsap.to(path, {
						strokeDashoffset: pathLength,
						opacity: 0,
						duration: 0.2,
						ease: 'power1.in'
					});
				}
			}
		});
	};

	useEffect(() => {
		handleLocationChange(location.pathname);
	}, [location]);

	const handleMouseEnter = (index: number) => {
		const path = navRefs.current[index];
		if (path && visibleNavigation[index].href !== location.pathname) {
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
		if (path && visibleNavigation[index].href !== location.pathname) {
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

	return (
		<nav className={`hidden md:flex items-center space-x-1 ${className || ''}`}>
			{visibleNavigation.map((item, index) => {
				const isActive = item.href === location.pathname;
				const isLeaderboard = item.label === 'Leaderboard';
				const viewBoxWidth = isLeaderboard ? 100 : 70;
				const defaultPath = isLeaderboard ? 'M5 10Q50 12 95 10' : 'M5 10Q35 12 65 10';
				
				// Special handling for Forum button
				if (item.label === 'Forum') {
					return (
						<ForumNavButton
							key={item.label}
							isActive={isActive}
						/>
					);
				}

				return (
					<NavLink
						key={item.label}
						href={item.href}
						prefetch={item.prefetch}
						analyticsLabel={item.analyticsLabel}
						aria-label={`Navigate to ${item.label}`}
					>
						<div
							className={`nav-item group px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
								isActive ? 'text-white nav-active' : 'text-zinc-300 hover:text-emerald-400'
							}`}
							onMouseEnter={() => handleMouseEnter(index)}
							onMouseLeave={() => handleMouseLeave(index)}
						>
							<span className="relative z-10">{item.label}</span>
							{/* SVG underline with randomized path */}
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
									d={navPaths[index] || defaultPath}
									stroke={isActive ? '#e55050' : '#10b981'}
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
