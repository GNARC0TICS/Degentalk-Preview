/**
 * Wallet Overview Component
 *
 * Main wallet interface showing balances, quick actions, and recent transactions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '../hooks/useWallet';
import { WalletFeatureChecker } from '@shared/wallet-features.config';
import {
	Wallet,
	ArrowUpRight,
	ArrowDownLeft,
	ShoppingCart,
	Zap,
	Settings,
	RefreshCw
} from 'lucide-react';

interface WalletOverviewProps {
	className?: string;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({ className }) => {
	const { user } = useAuth();
	const { wallet, isLoading, error, refetch } = useWallet();
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Check user's wallet feature access
	const userLevel = user?.level || 0;
	const isDev = process.env.NODE_ENV === 'development';
	const userId = user?.id;

	const features = WalletFeatureChecker.checkFeatures(
		[
			'wallet_deposits',
			'wallet_withdrawals',
			'wallet_tipping',
			'wallet_shop',
			'wallet_rain',
			'wallet_advanced',
			'wallet_dev'
		],
		userLevel,
		isDev,
		userId
	);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	};

	const formatDGT = (amount: number) => {
		return amount.toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 8
		});
	};

	const formatUSD = (amount: number) => {
		return amount.toLocaleString(undefined, {
			style: 'currency',
			currency: 'USD'
		});
	};

	if (isLoading) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<div className="flex items-center justify-center h-32">
						<RefreshCw className="h-6 w-6 animate-spin" />
						<span className="ml-2">Loading wallet...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<div className="text-center text-red-500">
						<p>Error loading wallet: {error.message}</p>
						<Button onClick={handleRefresh} variant="outline" className="mt-2">
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Wallet className="h-5 w-5" />
						Wallet
					</CardTitle>
					<div className="flex items-center gap-2">
						{features.wallet_dev && <Badge variant="secondary">DEV</Badge>}
						<Button onClick={handleRefresh} variant="ghost" size="sm" disabled={isRefreshing}>
							<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Balance Display */}
				<div className="space-y-4">
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-4">
						<div className="text-sm text-muted-foreground">DGT Balance</div>
						<div className="text-2xl font-bold">{formatDGT(wallet?.dgt || 0)} DGT</div>
						<div className="text-sm text-muted-foreground">
							≈ {formatUSD((wallet?.dgt || 0) * 0.1)}
						</div>
					</div>

					{/* Crypto Balances */}
					{wallet?.crypto && wallet.crypto.length > 0 && (
						<div className="space-y-2">
							<div className="text-sm font-medium">Crypto Balances</div>
							{wallet.crypto.map((crypto, index) => (
								<div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
									<div className="font-medium">{crypto.currency}</div>
									<div className="text-right">
										<div className="font-mono">{crypto.balance}</div>
										{crypto.usdValue && (
											<div className="text-xs text-muted-foreground">
												{formatUSD(crypto.usdValue)}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<Separator />

				{/* Quick Actions */}
				<div className="space-y-3">
					<div className="text-sm font-medium">Quick Actions</div>
					<div className="grid grid-cols-2 gap-2">
						{features.wallet_deposits && (
							<Button variant="outline" size="sm" className="flex-1">
								<ArrowDownLeft className="h-4 w-4 mr-2" />
								Deposit
							</Button>
						)}

						{features.wallet_withdrawals && (
							<Button variant="outline" size="sm" className="flex-1">
								<ArrowUpRight className="h-4 w-4 mr-2" />
								Withdraw
							</Button>
						)}

						{features.wallet_tipping && (
							<Button variant="outline" size="sm" className="flex-1">
								<Zap className="h-4 w-4 mr-2" />
								Tip
							</Button>
						)}

						{features.wallet_shop && (
							<Button variant="outline" size="sm" className="flex-1">
								<ShoppingCart className="h-4 w-4 mr-2" />
								Shop
							</Button>
						)}
					</div>
				</div>

				{/* Dev Tools */}
				{features.wallet_dev && (
					<>
						<Separator />
						<div className="space-y-3">
							<div className="text-sm font-medium text-orange-600">Dev Tools</div>
							<div className="grid grid-cols-2 gap-2">
								<Button variant="outline" size="sm" className="text-xs">
									Top Up DGT
								</Button>
								<Button variant="outline" size="sm" className="text-xs">
									Mock Webhook
								</Button>
								<Button variant="outline" size="sm" className="text-xs">
									Reset Wallet
								</Button>
								<Button variant="outline" size="sm" className="text-xs">
									<Settings className="h-3 w-3 mr-1" />
									Debug
								</Button>
							</div>
						</div>
					</>
				)}

				{/* Feature Access Info */}
				{features.wallet_advanced && (
					<>
						<Separator />
						<div className="space-y-2">
							<div className="text-sm font-medium">Feature Access</div>
							<div className="text-xs text-muted-foreground space-y-1">
								<div className="flex justify-between">
									<span>Level:</span>
									<span>{userLevel}</span>
								</div>
								<div className="flex justify-between">
									<span>Features:</span>
									<span>{Object.values(features).filter(Boolean).length}/7</span>
								</div>
								{!features.wallet_withdrawals && (
									<div className="text-orange-600">Level 5 required for withdrawals</div>
								)}
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};
