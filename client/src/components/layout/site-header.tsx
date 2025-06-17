import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
	MessageSquare,
	ShoppingBag,
	User,
	ChevronDown,
	X,
	Search,
	Wallet,
	LogOut,
	Shield,
	Settings,
	Link2,
} from 'lucide-react';
import { WalletSheet } from '@/components/economy/wallet/WalletSheet';
import ChartMenu from '@/components/ui/candlestick-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/config/admin-routes';
import { useAuthWrapper } from '@/hooks/wrappers/use-auth-wrapper';
import { Separator } from '@/components/ui/separator';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import gsap from 'gsap';

// Function to generate random underline paths
const generateRandomPath = () => {
	// Width of the SVG viewbox
	const width = 100; // Using percentage-based width
	// Generate random control points
	const startX = 5 + Math.random() * 5;
	const startY = 30 + Math.random() * 5;
	
	// Create random points along the path
	const points = [];
	let currentX = startX;
	
	// Generate 3-5 random points
	const numPoints = 3 + Math.floor(Math.random() * 3);
	
	for (let i = 0; i < numPoints; i++) {
		const x = currentX + (width / numPoints) * 0.8 + Math.random() * (width / numPoints) * 0.4;
		const y = 25 + Math.random() * 10;
		points.push({ x, y });
		currentX = x;
	}
	
	// Ensure the last point is near the right edge
	points.push({ x: width - 5, y: 30 + Math.random() * 5 });
	
	// Create path with random variations
	let path = `M${startX} ${startY}`;
	
	points.forEach((point, i) => {
		// Add some randomized curves
		if (i % 2 === 0 && i > 0) {
			const prevPoint = points[i-1];
			const controlX1 = prevPoint.x + (point.x - prevPoint.x) * 0.5 + Math.random() * 5 - 2.5;
			const controlY1 = prevPoint.y + Math.random() * 10 - 5;
			path += ` C${controlX1} ${controlY1}, ${point.x - 10} ${point.y}, ${point.x} ${point.y}`;
		} else {
			path += ` L${point.x} ${point.y}`;
		}
	});
	
	return path;
};

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Type extensions for development mode
type ExtendedUserData = {
	username: string;
	isAdmin?: boolean;
	isModerator?: boolean;
	level?: number;
	// other properties
};

// Custom Megaphone icon provided by design team
const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 256 256"
		fill="none"
		stroke="currentColor"
		strokeWidth={12}
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="M246 120a46.05 46.05 0 0 0-46-46h-39.85c-2.58-.15-54.1-3.57-103.15-44.71A14 14 0 0 0 34 40v160a13.85 13.85 0 0 0 8.07 12.68A14.2 14.2 0 0 0 48 214a13.9 13.9 0 0 0 9-3.3c40-33.52 81.57-42 97-44.07v34a14 14 0 0 0 6.23 11.65l11 7.33a14 14 0 0 0 21.32-8.17l12.13-45.71A46.07 46.07 0 0 0 246 120M49.29 201.52A2 2 0 0 1 46 200V40a1.9 1.9 0 0 1 1.15-1.8A2.1 2.1 0 0 1 48 38a1.9 1.9 0 0 1 1.26.48c44 36.92 89 45.19 104.71 47v69c-15.68 1.85-60.67 10.13-104.68 47.04m131.64 7a2 2 0 0 1-3.05 1.18l-11-7.33a2 2 0 0 1-.89-1.67V166h26.2ZM200 154h-34V86h34a34 34 0 1 1 0 68" />
	</svg>
);

export function SiteHeader() {
	const [isOpen, setIsOpen] = useState(false);
	const [location] = useLocation();
	const [navPaths, setNavPaths] = useState<string[]>([]);
	const navRefs = useRef<(SVGPathElement | null)[]>([]);

	const { user, logoutMutation } = useAuthWrapper() || {};

	// State for wallet sheet
	const [isWalletOpen, setIsWalletOpen] = useState(false);
	// State for notifications popover
	const [isNotificationsPanel, setIsNotificationsPanelOpen] = useState(false);

	// For development, create a mock user
	const mockUser: ExtendedUserData = {
		username: 'DevUser',
		isAdmin: true,
		isModerator: true,
		level: 99
	};

	// Use real user in production, mock user in development
	const displayUser = isDevelopment ? mockUser : (user as ExtendedUserData | null);

	// In development we're always authenticated
	const isAuthenticated = isDevelopment ? true : !!user;

	const navigation = [
		{ name: 'Home', href: '/' },
		{ name: 'Forum', href: '/forums' },
		{ name: 'Shop', href: '/shop' },
		{ name: 'Leaderboard', href: '/leaderboard' }
	];

	// Generate random paths on component mount and set up GSAP animations
	useEffect(() => {
		const paths = navigation.map(() => generateRandomPath());
		setNavPaths(paths);
		
		navRefs.current = navRefs.current.slice(0, navigation.length);
		
		setTimeout(() => {
			navRefs.current.forEach((path, index) => {
				if (path) {
					const pathLength = path.getTotalLength();
					const isActive = navigation[index].href === location;
					gsap.set(path, { 
						strokeDasharray: pathLength,
						strokeDashoffset: isActive ? 0 : pathLength,
						opacity: isActive ? 1 : 0 // Set initial opacity
					});
				}
			});
		}, 100); 
	}, []);

	const handleLocationChange = (currentLocation: string, isInitialSetup = false) => {
		navRefs.current.forEach((path, index) => {
			if (path) {
				const pathLength = path.getTotalLength();
				const isActive = navigation[index].href === currentLocation;

				gsap.killTweensOf(path); 

				if (isActive) {
					gsap.to(path, { 
						strokeDashoffset: 0,
						opacity: 1,
						duration: isInitialSetup ? 0.01 : 0.3, // Virtually instant on initial setup
						ease: "power2.out"
					});
				} else {
					gsap.to(path, { 
						strokeDashoffset: pathLength,
						opacity: 0,
						duration: 0.2, 
						ease: "power1.in"
					});
				}
			}
		});
	};

	// Update active path when location changes
	useEffect(() => {
        handleLocationChange(location);
	}, [location]);

	// Setup hover animations
	const handleMouseEnter = (index: number) => {
		const path = navRefs.current[index];
		if (path && navigation[index].href !== location) {
			gsap.killTweensOf(path); 
			gsap.to(path, { 
				strokeDashoffset: 0,
				opacity: 1,
				duration: 0.3, 
				ease: "power2.out"
			});
		}
	};

	const handleMouseLeave = (index: number) => {
		const path = navRefs.current[index];
		if (path && navigation[index].href !== location) {
			const pathLength = path.getTotalLength();
			gsap.killTweensOf(path); 
			gsap.to(path, { 
				strokeDashoffset: pathLength,
				opacity: 0,
				duration: 0.2, 
				ease: "power1.in"
			});
		}
	};

	// Handle logout
	const handleLogout = () => {
		if (!isDevelopment && logoutMutation?.mutate) {
			logoutMutation.mutate(undefined);
		}
	};

	return (
		<header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md transition-all">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center">
						<Link href="/">
							<div className="flex items-center cursor-pointer">
								<span className="text-xl font-bold text-white">Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup></span>
							</div>
						</Link>
					</div>

					{/* Desktop Navigation with animated underline */}
					<nav className="hidden md:flex items-center space-x-1">
						{navigation.map((item, index) => {
							const isActive = item.href === location;
							return (
								<Link key={item.name} href={item.href}>
									<div
										className={`nav-item group px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
											isActive
												? 'text-white nav-active'
												: 'text-zinc-300 hover:text-emerald-400'
										}`}
										onMouseEnter={() => handleMouseEnter(index)}
										onMouseLeave={() => handleMouseLeave(index)}
									>
										<span className="relative z-10">{item.name}</span>
										{/* SVG underline with randomized path */}
										<svg
											className="w-full h-2"
											viewBox="0 0 100 41"
											fill="none"
											preserveAspectRatio="none"
											style={{ overflow: 'visible' }}
										>
											<path
												ref={el => navRefs.current[index] = el}
												className="nav-underline"
												d={navPaths[index] || "M5 30L25 32S50 34 75 31L95 30"}
												stroke={isActive ? "#e55050" : "#10b981"}
												strokeWidth="5.5"
												strokeLinecap="round"
											/>
										</svg>
									</div>
								</Link>
							);
						})}
					</nav>

					{/* Search Box */}
					<div className="hidden md:flex flex-1 max-w-md mx-4">
						<div className="relative w-full">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-4 w-4 text-zinc-500" />
							</div>
							<Input
								type="text"
								placeholder="Search threads..."
								className="pl-10 bg-zinc-800/50 border-zinc-700 text-sm w-full"
							/>
						</div>
					</div>

					{/* User Section */}
					<div className="hidden md:flex items-center">
						{isAuthenticated && displayUser ? (
							<div className="flex items-center space-x-4">
								{/* Notification Icon */}
								<Popover
									open={isNotificationsPanel}
									onOpenChange={(isOpen) => {
										setIsNotificationsPanelOpen(isOpen);
									}}
								>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="relative text-zinc-400 hover:text-emerald-400 focus:text-emerald-400 transition-all duration-200"
											onClick={() => setIsNotificationsPanelOpen(true)}
										>
											<MegaphoneIcon className="h-5 w-5" />
											<Badge className="absolute -top-1 -right-1 px-1.5 h-4 min-w-4 bg-red-500 flex items-center justify-center text-[10px]">
												3
											</Badge>
										</Button>
									</PopoverTrigger>
									<PopoverContent align="end" className="w-96 p-0">
										{/* Notifications Panel */}
										<NotificationPanel />
									</PopoverContent>
								</Popover>

								{/* Wallet Button - Opens Wallet Sheet */}
								<Button
									variant="ghost"
									size="icon"
									className="text-zinc-400 hover:text-emerald-400 focus:text-emerald-400 transition-all duration-200"
									onClick={() => setIsWalletOpen(true)}
								>
									<Wallet className="h-5 w-5" />
								</Button>

								{/* Admin/Mod Panel Links */}
								{displayUser.isAdmin && (
									<Link href="/admin">
										<div className="text-zinc-400 hover:text-white">
											<Button variant="ghost" size="icon">
												<Shield className="h-5 w-5" />
											</Button>
										</div>
									</Link>
								)}

								{displayUser.isModerator && !displayUser.isAdmin && (
									<Link href="/mod">
										<div className="text-zinc-400 hover:text-white">
											<Button variant="ghost" size="icon">
												<Shield className="h-5 w-5" />
											</Button>
										</div>
									</Link>
								)}

								{/* User Dropdown */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="p-1">
											<div className="flex items-center space-x-2">
												<Avatar className="h-8 w-8">
													<AvatarFallback className="bg-emerald-800 text-emerald-200">
														{displayUser?.username?.substring(0, 2)?.toUpperCase() || 'UN'}
													</AvatarFallback>
												</Avatar>
												<span className="hidden lg:flex items-center">
													<span className="text-zinc-300">{displayUser?.username || 'User'}</span>
													<ChevronDown className="ml-1 h-4 w-4 text-zinc-500" />
												</span>
											</div>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<DropdownMenuLabel>My Account</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<Link href={`/profile/${displayUser.username}`}>
											<DropdownMenuItem>
												<div className="flex w-full items-center cursor-pointer">
													<User className="mr-2 h-4 w-4" />
													<span>Profile</span>
												</div>
											</DropdownMenuItem>
										</Link>
										<DropdownMenuItem onClick={() => setIsWalletOpen(true)}>
											<div className="flex w-full items-center cursor-pointer">
												<Wallet className="mr-2 h-4 w-4" />
												<span>Wallet</span>
											</div>
										</DropdownMenuItem>
										<Link href="/preferences">
											<DropdownMenuItem>
												<div className="flex w-full items-center cursor-pointer">
													<Settings className="mr-2 h-4 w-4" />
													<span>Settings</span>
												</div>
											</DropdownMenuItem>
										</Link>
										<Link href="/preferences?tab=referrals">
											<DropdownMenuItem>
												<div className="flex w-full items-center cursor-pointer">
													<Link2 className="mr-2 h-4 w-4" />
													<span>Referrals</span>
												</div>
											</DropdownMenuItem>
										</Link>
										<DropdownMenuSeparator />
										{displayUser.isAdmin && (
											<Link href="/admin">
												<DropdownMenuItem>
													<div className="flex w-full items-center cursor-pointer">
														<Shield className="mr-2 h-4 w-4" />
														<span>Admin Panel</span>
													</div>
												</DropdownMenuItem>
											</Link>
										)}
										{displayUser.isModerator && (
											<Link href="/mod">
												<DropdownMenuItem>
													<div className="flex w-full items-center cursor-pointer">
														<Shield className="mr-2 h-4 w-4" />
														<span>Moderator Panel</span>
													</div>
												</DropdownMenuItem>
											</Link>
										)}
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={handleLogout}>
											<LogOut className="mr-2 h-4 w-4" />
											<span>Log out</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<div className="flex items-center space-x-3">
								<Link href="/auth">
									<Button
										variant="outline"
										className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
									>
										Log In
									</Button>
								</Link>
								<Link href="/forums">
									<Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500">
										Sign Up
									</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<div className="p-1.5">
							<ChartMenu
								isActive={isOpen}
								onClick={() => setIsOpen(!isOpen)}
								className="scale-90"
								id="mobile-menu-button"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile menu, show/hide based on menu state */}
			{isOpen && (
				<div className="md:hidden bg-zinc-900 border-t border-zinc-800">
					<div className="px-2 pt-2 pb-3 space-y-1">
						<div className="p-2">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search className="h-4 w-4 text-zinc-500" />
								</div>
								<Input
									type="text"
									placeholder="Search threads..."
									className="pl-10 bg-zinc-800/50 border-zinc-700 text-sm w-full"
								/>
							</div>
						</div>

						{navigation.map((item) => (
							<Link key={item.name} href={item.href}>
								<div
									className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
										item.href === location
											? 'bg-zinc-800 text-white'
											: 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
									} transition-colors`}
									onClick={() => setIsOpen(false)}
								>
									{item.name}
								</div>
							</Link>
						))}

						{isAuthenticated && displayUser ? (
							<div className="pt-4 pb-3 border-t border-zinc-800">
								<div className="flex items-center px-3">
									<div className="flex-shrink-0">
										<Avatar className="h-10 w-10">
											<AvatarFallback className="bg-emerald-800 text-emerald-200">
												{displayUser?.username?.substring(0, 2)?.toUpperCase() || 'UN'}
											</AvatarFallback>
										</Avatar>
									</div>
									<div className="ml-3">
										<div className="text-base font-medium text-white">
											{displayUser?.username || 'User'}
										</div>
										<div className="text-sm font-medium text-zinc-500">
											Level {displayUser?.level || '0'}
										</div>
									</div>
								</div>
								<div className="mt-3 px-2 space-y-1">
									<Link href={`/profile/${displayUser.username}`}>
										<div
											className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
											onClick={() => setIsOpen(false)}
										>
											<User className="h-5 w-5 inline mr-2" />
											Profile
										</div>
									</Link>
									<div
										className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
										onClick={() => {
											setIsOpen(false);
											setIsWalletOpen(true);
										}}
									>
										<Wallet className="h-5 w-5 inline mr-2" />
										Wallet
									</div>
									<Link href="/preferences">
										<div
											className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
											onClick={() => setIsOpen(false)}
										>
											<Settings className="h-5 w-5 inline mr-2" />
											Settings
										</div>
									</Link>
									<Link href="/preferences?tab=referrals">
										<div
											className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
											onClick={() => setIsOpen(false)}
										>
											<Link2 className="h-5 w-5 inline mr-2" />
											Referrals
										</div>
									</Link>

									{displayUser.isAdmin && (
										<Link href="/admin">
											<div
												className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
												onClick={() => setIsOpen(false)}
											>
												<Shield className="h-5 w-5 inline mr-2" />
												Admin Panel
											</div>
										</Link>
									)}

									{displayUser.isModerator && (
										<Link href="/mod">
											<div
												className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
												onClick={() => setIsOpen(false)}
											>
												<Shield className="h-5 w-5 inline mr-2" />
												Moderator Panel
											</div>
										</Link>
									)}

									<div
										className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
										onClick={() => {
											handleLogout?.();
											setIsOpen(false);
										}}
									>
										<LogOut className="h-5 w-5 inline mr-2" />
										Log Out
									</div>
								</div>
							</div>
						) : (
							<div className="pt-4 pb-3 border-t border-zinc-800 px-3 space-y-2">
								<Link href="/forums" onClick={() => setIsOpen(false)}>
									<Button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500">
										Sign Up
									</Button>
								</Link>
								<Link href="/auth" onClick={() => setIsOpen(false)}>
									<Button className="w-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800">
										Log In
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Wallet Sheet */}
			<WalletSheet isOpen={isWalletOpen} onOpenChange={setIsWalletOpen} />
		</header>
	);
}
