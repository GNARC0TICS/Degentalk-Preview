import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@app/utils/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import {
	Wallet,
	Coins,
	ArrowUpRight,
	ArrowDownLeft,
	Plus,
	TrendingUp,
	ArrowDownToLine,
	ArrowUpToLine
} from 'lucide-react';

interface WalletData {
	dgtBalance: number;
	usdtBalance: number;
	lastTransaction?: {
		type: 'in' | 'out';
		amount: number;
		token: 'DGT' | 'USDT';
		time: string;
	};
}

interface WalletDashboardProps {
	variant?: 'mini' | 'compact' | 'standard' | 'detailed';
	className?: string;
	horizontal?: boolean;
	isLoggedIn?: boolean;
	walletData?: WalletData;
	showActions?: boolean;
}

/**
 * WalletDashboard - Unified wallet display component
 *
 * Replaces:
 * - components/economy/wallet-display.tsx
 * - components/sidebar/wallet-summary-widget.tsx
 * - components/economy/wallet/wallet-balance-display.tsx
 */
export function WalletDashboard({
	variant = 'standard',
	className,
	horizontal = false,
	isLoggedIn = false,
	walletData = { dgtBalance: 0, usdtBalance: 0 },
	showActions = true
}: WalletDashboardProps) {
	const formatBalance = (balance: number) => {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 6
		}).format(balance);
	};

	const handleWalletAction = (action: string) => {
		// console.log(`Wallet action: ${action}`);
		// Implement wallet actions
	};

	if (!isLoggedIn) {
		return (
			<Card className={cn('border-dashed', className)}>
				<CardContent className="p-4 text-center">
					<Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">Sign in to view wallet</p>
				</CardContent>
			</Card>
		);
	}

	if (variant === 'mini') {
		return (
			<div className={cn('flex items-center gap-2 text-sm', className)}>
				<Coins className="h-4 w-4 text-yellow-500" />
				<span className="font-medium">{formatBalance(walletData.dgtBalance)} DGT</span>
				<span className="text-muted-foreground">•</span>
				<span className="font-medium">${formatBalance(walletData.usdtBalance)}</span>
			</div>
		);
	}

	if (variant === 'compact') {
		const layout = horizontal ? 'flex items-center gap-4' : 'space-y-2';

		return (
			<div className={cn(layout, className)}>
				<div className="flex items-center gap-2">
					<Coins className="h-5 w-5 text-yellow-500" />
					<div>
						<div className="font-medium">{formatBalance(walletData.dgtBalance)} DGT</div>
						<div className="text-sm text-muted-foreground">
							${formatBalance(walletData.usdtBalance)} USDT
						</div>
					</div>
				</div>
				{showActions && (
					<div className="flex gap-1">
						<Button size="sm" variant="outline" onClick={() => handleWalletAction('deposit')}>
							<Plus className="h-3 w-3" />
						</Button>
						<Button size="sm" variant="outline" onClick={() => handleWalletAction('withdraw')}>
							<ArrowUpRight className="h-3 w-3" />
						</Button>
					</div>
				)}
			</div>
		);
	}

	// Standard and detailed variants
	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					<Wallet className="h-5 w-5" />
					Wallet
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Balance Display */}
				<div className={horizontal ? 'flex gap-6' : 'space-y-3'}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Coins className="h-5 w-5 text-yellow-500" />
							<span className="font-medium">DGT</span>
						</div>
						<div className="text-right">
							<div className="font-bold">{formatBalance(walletData.dgtBalance)}</div>
							{variant === 'detailed' && (
								<div className="text-xs text-muted-foreground">Degentalk Tokens</div>
							)}
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
								<span className="text-xs font-bold text-white">$</span>
							</div>
							<span className="font-medium">USDT</span>
						</div>
						<div className="text-right">
							<div className="font-bold">${formatBalance(walletData.usdtBalance)}</div>
							{variant === 'detailed' && (
								<div className="text-xs text-muted-foreground">US Dollar Tether</div>
							)}
						</div>
					</div>
				</div>

				{/* Last Transaction */}
				{variant === 'detailed' && walletData.lastTransaction && (
					<div className="pt-3 border-t">
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								{walletData.lastTransaction.type === 'in' ? (
									<ArrowDownLeft className="h-4 w-4 text-green-500" />
								) : (
									<ArrowUpRight className="h-4 w-4 text-red-500" />
								)}
								<span>Last transaction</span>
							</div>
							<div className="text-right">
								<div
									className={cn(
										'font-medium',
										walletData.lastTransaction.type === 'in' ? 'text-green-500' : 'text-red-500'
									)}
								>
									{walletData.lastTransaction.type === 'in' ? '+' : '-'}
									{formatBalance(walletData.lastTransaction.amount)}{' '}
									{walletData.lastTransaction.token}
								</div>
								<div className="text-xs text-muted-foreground">
									{walletData.lastTransaction.time}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Actions */}
				{showActions && (
					<div className="flex gap-2 pt-2">
						<Button size="sm" className="flex-1" onClick={() => handleWalletAction('deposit')}>
							<ArrowDownToLine className="h-4 w-4 mr-2" />
							Deposit
						</Button>
						<Button
							size="sm"
							variant="outline"
							className="flex-1"
							onClick={() => handleWalletAction('withdraw')}
						>
							<ArrowUpToLine className="h-4 w-4 mr-2" />
							Withdraw
						</Button>
						<Button size="sm" variant="outline" onClick={() => handleWalletAction('transfer')}>
							<TrendingUp className="h-4 w-4 mr-2" />
							Transfer
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Compound components for different use cases
export const WalletSummary = (props: Omit<WalletDashboardProps, 'variant'>) => (
	<WalletDashboard variant="compact" {...props} />
);

export const WalletMini = (props: Omit<WalletDashboardProps, 'variant'>) => (
	<WalletDashboard variant="mini" {...props} />
);

export const WalletDetailed = (props: Omit<WalletDashboardProps, 'variant'>) => (
	<WalletDashboard variant="detailed" {...props} />
);

// Legacy exports for migration
export const WalletDisplay = WalletDashboard;
export const WalletSummaryWidget = WalletSummary;
