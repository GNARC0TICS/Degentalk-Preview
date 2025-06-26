import React from 'react';
import { Wallet, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletOverviewCardProps {
	dgtBalance: number;
	walletBalanceUSDT?: number;
	walletPendingWithdrawals?: number;
	dgtPoints?: number;
	className?: string;
}

export function WalletOverviewCard({
	dgtBalance,
	walletBalanceUSDT = 0,
	walletPendingWithdrawals = 0,
	dgtPoints = 0,
	className
}: WalletOverviewCardProps) {
	const totalUSDValue = dgtBalance * 0.1 + walletBalanceUSDT;
	const hasPendingWithdrawals = walletPendingWithdrawals > 0;

	return (
		<div
			className={cn(
				'bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-sm',
				'border border-zinc-700/40 rounded-lg p-4 space-y-4',
				className
			)}
		>
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
					<Wallet className="h-4 w-4 text-emerald-400" />
					Wallet Overview
				</h3>
				{hasPendingWithdrawals && (
					<div className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-medium">
						Pending
					</div>
				)}
			</div>

			<div className="space-y-3">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<div className="text-2xl font-bold text-emerald-400">{dgtBalance.toLocaleString()}</div>
						<div className="text-xs text-zinc-400">DGT Balance</div>
					</div>
					<div className="space-y-1">
						<div className="text-2xl font-bold text-zinc-100">${totalUSDValue.toFixed(2)}</div>
						<div className="text-xs text-zinc-400">Total Value</div>
					</div>
				</div>

				{walletBalanceUSDT > 0 && (
					<div className="flex items-center justify-between p-2 bg-zinc-700/30 rounded-md">
						<span className="text-sm text-zinc-300">USDT</span>
						<span className="text-sm font-medium text-zinc-100">
							${walletBalanceUSDT.toFixed(2)}
						</span>
					</div>
				)}

				{dgtPoints > 0 && (
					<div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-md border border-purple-500/20">
						<span className="text-sm text-purple-300">DGT Points</span>
						<span className="text-sm font-medium text-purple-200">
							{dgtPoints.toLocaleString()}
						</span>
					</div>
				)}

				{hasPendingWithdrawals && (
					<div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
						<Clock className="h-4 w-4 text-amber-400" />
						<div className="flex-1 text-sm">
							<div className="text-amber-300">Pending Withdrawal</div>
							<div className="text-amber-400 font-medium">
								${walletPendingWithdrawals.toFixed(2)}
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="pt-2 border-t border-zinc-700/30">
				<div className="text-xs text-zinc-500 text-center">DGT @ $0.10 • 1 DGT = $0.10 USD</div>
			</div>
		</div>
	);
}
