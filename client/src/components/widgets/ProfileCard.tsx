import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Progress } from '@app/components/ui/progress';
import { Button } from '@app/components/ui/button';
import { useAuth } from '@app/hooks/use-auth';
import { useWallet } from '@app/hooks/use-wallet';
import {
	Crown,
	Zap,
	Coins,
	TrendingUp,
	MessageSquare,
	Settings,
	ExternalLink,
	Sparkles,
	Shield,
	Award
} from 'lucide-react';
import { cn } from '@app/utils/utils';
import { formatDistanceToNow } from 'date-fns';

interface ProfileCardProps {
	variant?: 'sidebar' | 'compact' | 'mini';
	className?: string;
	showActions?: boolean;
}

export function ProfileCard({
	variant = 'sidebar',
	className = '',
	showActions = true
}: ProfileCardProps) {
	const { user, isAuthenticated, isDevMode, currentMockRole } = useAuth();
	const { balance } = useWallet();

	if (!isAuthenticated || !user) {
		return (
			<Card className={cn('bg-zinc-900/80 border-zinc-800 backdrop-blur-md', className)}>
				<CardContent className="p-4 text-center">
					<div className="text-zinc-400 text-sm">
						{isDevMode ? 'No mock user selected' : 'Sign in to view profile'}
					</div>
					{!isDevMode && (
						<Button size="sm" className="mt-2" asChild>
							<Link to="/login">Sign In</Link>
						</Button>
					)}
				</CardContent>
			</Card>
		);
	}

	// Calculate level progress (assuming each level needs more XP)
	const currentLevel = user.level || 1;
	const currentXP = user.xp || 0;
	const xpForCurrentLevel = Math.pow(currentLevel, 2) * 100;
	const xpForNextLevel = Math.pow(currentLevel + 1, 2) * 100;
	const levelProgress =
		((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

	// Role colors and icons
	const roleConfig = {
		admin: { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800', icon: Crown },
		mod: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800', icon: Shield },
		user: { color: 'text-zinc-400', bg: 'bg-zinc-900/20', border: 'border-zinc-800', icon: Award }
	};

	const userRole = user.role || 'user';
	const config = roleConfig[userRole] || roleConfig.user;
	const RoleIcon = config.icon;

	// DGT Balance
	const dgtBalance = balance || 0;

	if (variant === 'mini') {
		return (
			<Card className={cn('bg-zinc-900/80 border-zinc-800 backdrop-blur-md', className)}>
				<CardContent className="p-2">
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8">
							<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
							<AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
								{user.username.substring(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="font-medium text-zinc-200 text-sm truncate">{user.username}</div>
							<div className="flex items-center gap-1 text-xs text-zinc-400">
								<Coins className="h-3 w-3" />
								<span>{dgtBalance.toLocaleString()}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (variant === 'compact') {
		return (
			<Card className={cn('bg-zinc-900/80 border-zinc-800 backdrop-blur-md', className)}>
				<CardContent className="p-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
							<AvatarFallback className="bg-zinc-800 text-zinc-300">
								{user.username.substring(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="font-semibold text-zinc-200 truncate">{user.username}</span>
								<Badge
									variant="outline"
									className={cn(config.bg, config.border, config.color, 'text-xs')}
								>
									<RoleIcon className="h-3 w-3 mr-1" />
									{userRole}
								</Badge>
							</div>
							<div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
								<span className="flex items-center gap-1">
									<Zap className="h-3 w-3" />
									Level {currentLevel}
								</span>
								<span className="flex items-center gap-1">
									<Coins className="h-3 w-3" />
									{dgtBalance.toLocaleString()} DGT
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Full sidebar variant
	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Card
				className={cn(
					'bg-gradient-to-br from-zinc-900/90 to-zinc-900/60 border-zinc-800/60 shadow-xl backdrop-blur-md overflow-hidden',
					className
				)}
			>
				{/* Header with Avatar and Basic Info */}
				<div className="relative">
					{/* Background Pattern */}
					<div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-blue-900/10" />

					<CardContent className="relative p-4">
						<div className="flex items-start gap-3">
							<div className="relative">
								<Avatar className="h-14 w-14 border-2 border-zinc-700 shadow-lg">
									<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
									<AvatarFallback className="bg-zinc-800 text-zinc-300 text-lg font-semibold">
										{user.username.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{/* Online indicator */}
								<div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
								{/* VIP Crown overlay */}
								{user.role === 'admin' && (
									<div className="absolute -top-1 -right-1 text-yellow-400">
										<Crown className="h-4 w-4 drop-shadow-md" />
									</div>
								)}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="font-bold text-zinc-100 text-lg truncate">{user.username}</h3>
									{isDevMode && (
										<Badge
											variant="outline"
											className="bg-amber-900/20 border-amber-700 text-amber-300 text-xs"
										>
											DEV
										</Badge>
									)}
								</div>

								<div className="flex items-center gap-2 mb-2">
									<Badge
										variant="outline"
										className={cn(config.bg, config.border, config.color, 'text-xs font-medium')}
									>
										<RoleIcon className="h-3 w-3 mr-1" />
										{userRole.charAt(0).toUpperCase() + userRole.slice(1)}
									</Badge>

									{user.isVerified && (
										<Badge
											variant="outline"
											className="bg-blue-900/20 border-blue-700 text-blue-300 text-xs"
										>
											<Sparkles className="h-3 w-3 mr-1" />
											Verified
										</Badge>
									)}
								</div>

								{/* Level and XP */}
								<div className="space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span className="text-zinc-300 font-medium">Level {currentLevel}</span>
										<span className="text-zinc-400">{currentXP.toLocaleString()} XP</span>
									</div>
									<Progress
										value={Math.max(0, Math.min(100, levelProgress))}
										className="h-2 bg-zinc-800"
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</div>

				{/* Stats Section */}
				<CardContent className="p-4 pt-0">
					<div className="grid grid-cols-2 gap-3 mb-4">
						{/* DGT Balance */}
						<div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
							<div className="flex items-center gap-2 mb-1">
								<Coins className="h-4 w-4 text-emerald-400" />
								<span className="text-xs font-medium text-zinc-400">DGT Balance</span>
							</div>
							<div className="text-lg font-bold text-emerald-300">
								{dgtBalance.toLocaleString()}
							</div>
						</div>

						{/* Reputation */}
						<div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
							<div className="flex items-center gap-2 mb-1">
								<TrendingUp className="h-4 w-4 text-blue-400" />
								<span className="text-xs font-medium text-zinc-400">Reputation</span>
							</div>
							<div className="text-lg font-bold text-blue-300">
								{(user.reputation || 0).toLocaleString()}
							</div>
						</div>
					</div>

					{/* Bio */}
					{user.bio && (
						<div className="mb-4">
							<div className="text-sm text-zinc-300 leading-relaxed line-clamp-2">{user.bio}</div>
						</div>
					)}

					{/* Quick Actions */}
					{showActions && (
						<div className="space-y-2">
							<Button
								variant="outline"
								size="sm"
								className="w-full bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 text-zinc-300"
								asChild
							>
								<Link to={`/profile/${user.username}`}>
									<ExternalLink className="h-4 w-4 mr-2" />
									View Profile
								</Link>
							</Button>

							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="flex-1 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 text-zinc-300"
									asChild
								>
									<Link to="/wallet">
										<Coins className="h-4 w-4 mr-1" />
										Wallet
									</Link>
								</Button>

								<Button
									variant="outline"
									size="sm"
									className="flex-1 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 text-zinc-300"
									asChild
								>
									<Link to="/settings">
										<Settings className="h-4 w-4 mr-1" />
										Settings
									</Link>
								</Button>
							</div>
						</div>
					)}

					{/* Member Since */}
					<div className="mt-3 pt-3 border-t border-zinc-800/50">
						<div className="text-xs text-zinc-500 text-center">
							Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export default ProfileCard;
