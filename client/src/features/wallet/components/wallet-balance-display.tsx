import React from 'react';
import {
	CircleDollarSign,
	Award,
	TrendingUp,
	TrendingDown,
	Clock,
	CheckCircle2,
	RefreshCw
} from 'lucide-react';
import { AnimatedBalance } from './animated-balance.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import type { WalletBalance } from '@/features/wallet/services/wallet-api.service';

export interface WalletBalanceDisplayProps {
	balance?: WalletBalance;
	isLoading?: boolean;
	error?: any;
	onRefresh?: () => void;
	className?: string;
	pendingTransactions?: number;
}

export function WalletBalanceDisplay({
	balance,
	isLoading,
	error,
	onRefresh,
	className = '',
	pendingTransactions = 0
}: WalletBalanceDisplayProps) {
	// Loading state
	if (isLoading) {
		return (
			<div className={cn('flex flex-col space-y-4', className)}>
				<div className="animate-pulse">
					<div className="h-8 bg-zinc-800 rounded mb-2"></div>
					<div className="h-6 bg-zinc-800 rounded mb-4"></div>
					<div className="h-20 bg-zinc-800 rounded"></div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className={cn('flex flex-col items-center space-y-4 p-6', className)}>
				<p className="text-red-400 text-center">Failed to load wallet balance</p>
				{onRefresh && (
					<Button variant="outline" onClick={onRefresh} size="sm">
						<RefreshCw className="w-4 h-4 mr-2" />
						Retry
					</Button>
				)}
			</div>
		);
	}

	const dgtBalance = balance?.dgt || 0;
	const totalCryptoValue = (balance?.btc || 0) + (balance?.eth || 0) + (balance?.usdt || 0);

	return (
		<div
			className={cn(
				'bg-gradient-to-br from-black/40 to-zinc-900/40 rounded-xl p-4 sm:p-6 border border-zinc-800/80 shadow-xl backdrop-blur-sm',
				className
			)}
		>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-lg font-semibold text-white flex items-center">
						<div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center mr-3 shadow-lg">
							<Award className="h-4 w-4 text-black" />
						</div>
						Wallet Balance
					</h3>
					<p className="text-sm text-zinc-400 mt-1">Your DGT tokens and crypto balances</p>
				</div>

				{/* Refresh button */}
				<div className="flex items-center space-x-2">
					{onRefresh && (
						<Button variant="outline" size="sm" onClick={onRefresh}>
							<RefreshCw className="h-4 w-4" />
						</Button>
					)}
					<div className="flex items-center space-x-2">
						{pendingTransactions > 0 && (
							<Badge
								variant="outline"
								className="text-amber-400 border-amber-600/30 bg-amber-900/20 animate-pulse"
							>
								<Clock className="h-3 w-3 mr-1" />
								{pendingTransactions} pending
							</Badge>
						)}
						<Badge
							variant="outline"
							className="text-emerald-400 border-emerald-600/30 bg-emerald-900/20"
						>
							<CheckCircle2 className="h-3 w-3 mr-1" />
							Live
						</Badge>
					</div>
				</div>
			</div>

			{/* DGT Balance - Primary Display */}
			<div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 rounded-lg p-4 sm:p-6 border border-emerald-800/30 hover:border-emerald-700/50 transition-all group mb-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center space-x-3">
						<div className="bg-emerald-900/50 rounded-full p-3 group-hover:bg-emerald-900/70 transition-colors">
							<Award className="h-6 w-6 text-emerald-400" />
						</div>
						<div>
							<div className="text-xs text-emerald-400/80 uppercase font-medium tracking-wide">
								DGT Balance (Primary)
							</div>
							<div className="text-3xl sm:text-4xl font-bold text-white flex items-baseline">
								<AnimatedBalance value={dgtBalance} decimalPlaces={2} className="font-bold" />
								<span className="text-lg ml-2 text-emerald-400">DGT</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-3 pt-3 border-t border-emerald-800/30">
					<div className="text-xs text-zinc-400">
						💡 All crypto deposits are automatically converted to DGT at $0.10 per token
					</div>
				</div>
			</div>

			{/* Crypto Balances - Secondary Display */}
			{totalCryptoValue > 0 && (
				<div className="bg-gradient-to-br from-zinc-900/20 to-zinc-800/10 rounded-lg p-4 sm:p-5 border border-zinc-800/30 hover:border-zinc-700/50 transition-all">
					<div className="flex items-center space-x-3 mb-4">
						<div className="bg-zinc-900/50 rounded-full p-2.5">
							<CircleDollarSign className="h-5 w-5 text-zinc-400" />
						</div>
						<div>
							<div className="text-xs text-zinc-400/80 uppercase font-medium tracking-wide">
								Crypto Balances
							</div>
							<div className="text-sm text-zinc-300">Available for conversion to DGT</div>
						</div>
					</div>

					<div className="space-y-2">
						{balance?.btc && balance.btc > 0 && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-zinc-300">BTC</span>
								<span className="text-zinc-400 font-medium">{balance.btc.toFixed(6)}</span>
							</div>
						)}
						{balance?.eth && balance.eth > 0 && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-zinc-300">ETH</span>
								<span className="text-zinc-400 font-medium">{balance.eth.toFixed(6)}</span>
							</div>
						)}
						{balance?.usdt && balance.usdt > 0 && (
							<div className="flex items-center justify-between text-sm">
								<span className="text-zinc-300">USDT</span>
								<span className="text-zinc-400 font-medium">{balance.usdt.toFixed(2)}</span>
							</div>
						)}
					</div>

					<div className="mt-3 pt-3 border-t border-zinc-800/30">
						<div className="text-xs text-zinc-400">
							⚡ These balances can be converted to DGT through admin action
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
