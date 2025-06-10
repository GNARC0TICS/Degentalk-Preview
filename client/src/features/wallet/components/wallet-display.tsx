import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, TrendingUp, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';

interface WalletDisplayProps {
	variant?: 'mini' | 'standard' | 'detailed';
	className?: string;
	horizontal?: boolean;
}

/**
 * Displays the user's wallet information including DGT points and USDT balance
 * @param variant 'mini', 'standard', or 'detailed' display modes
 * @param className Additional CSS classes
 * @param horizontal Display in horizontal layout (for header etc.)
 */
export function WalletDisplay({
	variant = 'standard',
	className,
	horizontal = false
}: WalletDisplayProps) {
	// Fetch wallet data from API
	const { data: walletData, isLoading } = useQuery({
		queryKey: ['/api/wallet'],
		enabled: true
	});

	if (isLoading) {
		return (
			<Card className={cn('bg-zinc-900/50 border-zinc-800', className)}>
				<CardContent className="p-4">
					<div className="flex items-center space-x-2">
						<div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
						<div className="space-y-2">
							<div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
							<div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Sample data in case the API hasn't loaded yet or we're in development
	const wallet = walletData || {
		dgtPoints: 0,
		dgtWalletBalance: 0,
		walletBalanceUSDT: 0,
		walletAddress: '',
		isConnected: false
	};

	if (variant === 'mini') {
		return (
			<div className={cn('flex items-center space-x-2', className)}>
				<div className="h-6 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_8px_rgba(0,255,170,0.3)]">
					<Wallet className="h-3 w-3 text-black" />
				</div>
				<div className="text-sm font-medium">{wallet.dgtPoints.toLocaleString()} DGT</div>
			</div>
		);
	}

	const containerClasses = horizontal
		? 'flex-row items-center justify-between'
		: 'flex-col space-y-4';

	return (
		<Card
			className={cn(
				'bg-zinc-900/50 border-zinc-800 overflow-hidden transition-all hover:bg-zinc-900',
				variant === 'detailed' && 'glow-sm',
				className
			)}
		>
			<div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10 pointer-events-none" />

			<CardContent className={cn('p-4', variant === 'detailed' && 'p-5')}>
				<div className={cn('flex', containerClasses)}>
					{/* Header with wallet icon */}
					<div className="flex items-center space-x-3">
						<div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_8px_rgba(0,255,170,0.3)] animate-pulse-glow">
							<Wallet className="h-5 w-5 text-black" />
						</div>
						<div>
							<h3 className="font-semibold text-white">Your Wallet</h3>
							<p className="text-xs text-zinc-400">
								{wallet.walletAddress
									? `${wallet.walletAddress.slice(0, 6)}...${wallet.walletAddress.slice(-4)}`
									: 'No wallet connected'}
							</p>
						</div>
					</div>

					{/* Balance display */}
					<div className={cn('grid gap-2', horizontal ? 'grid-cols-2' : 'grid-cols-1 mt-2')}>
						<div className="bg-black/40 backdrop-blur-sm border border-zinc-800 rounded-lg p-3">
							<div className="text-xs text-zinc-500 flex items-center">
								<TrendingUp className="mr-1 h-3 w-3" /> DGT Points
							</div>
							<div className="text-lg font-bold text-white">
								{wallet.dgtPoints.toLocaleString()}
							</div>
						</div>

						<div className="bg-black/40 backdrop-blur-sm border border-zinc-800 rounded-lg p-3">
							<div className="text-xs text-zinc-500 flex items-center">
								<Wallet className="mr-1 h-3 w-3" /> USDT Balance
							</div>
							<div className="text-lg font-bold text-white">
								{wallet.walletBalanceUSDT.toFixed(2)}
							</div>
						</div>
					</div>

					{/* Action buttons - only shown in detailed mode */}
					{variant === 'detailed' && (
						<div className="grid grid-cols-2 gap-2 mt-4">
							<Button variant="wallet" size="sm" leftIcon={<ArrowDownToLine className="h-4 w-4" />}>
								Deposit
							</Button>
							<Button variant="wallet" size="sm" leftIcon={<ArrowUpToLine className="h-4 w-4" />}>
								Withdraw
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
