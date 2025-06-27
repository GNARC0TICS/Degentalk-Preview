import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Coins, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';

interface WalletSummaryWidgetProps {
	isLoggedIn?: boolean;
	walletData?: {
		dgtBalance: number;
		usdtBalance: number;
		lastTransaction?: {
			type: 'in' | 'out';
			amount: number;
			token: 'DGT' | 'USDT';
			time: string;
		};
	};
}

export default function WalletSummaryWidget({
	isLoggedIn = false,
	walletData = { dgtBalance: 0, usdtBalance: 0 }
}: WalletSummaryWidgetProps) {
	// Placeholder function for wallet actions
	const handleWalletAction = () => {
		// Wallet action clicked
	};

	// Handling not logged in state
	if (!isLoggedIn) {
		return (
			<Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg flex items-center">
						<Wallet className="h-5 w-5 text-emerald-500 mr-2" />
						Your Wallet
					</CardTitle>
				</CardHeader>
				<CardContent className="pb-6">
					<div className="text-center py-6">
						<div className="mb-4 bg-zinc-800/50 rounded-lg p-6 inline-flex items-center justify-center">
							<Wallet className="h-10 w-10 text-zinc-500" />
						</div>
						<p className="text-zinc-400 mb-4">
							Connect your wallet to access Degentalk's full economy
						</p>
						<Button
							onClick={handleWalletAction}
							className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
						>
							<Wallet className="h-4 w-4 mr-2" />
							Connect Wallet
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Logged in state
	return (
		<Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center">
					<Wallet className="h-5 w-5 text-emerald-500 mr-2" />
					Your Wallet
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Balances */}
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-zinc-800/50 p-3 rounded-lg">
						<div className="flex items-center mb-1">
							<div className="w-6 h-6 rounded-full bg-emerald-900/60 flex items-center justify-center mr-2">
								<Coins className="h-3 w-3 text-emerald-400" />
							</div>
							<span className="text-xs text-zinc-400">DGT Balance</span>
						</div>
						<div className="font-bold text-lg text-emerald-400">
							{walletData.dgtBalance.toLocaleString()}
						</div>
					</div>

					<div className="bg-zinc-800/50 p-3 rounded-lg">
						<div className="flex items-center mb-1">
							<div className="w-6 h-6 rounded-full bg-cyan-900/60 flex items-center justify-center mr-2">
								<Coins className="h-3 w-3 text-cyan-400" />
							</div>
							<span className="text-xs text-zinc-400">USDT Balance</span>
						</div>
						<div className="font-bold text-lg text-cyan-400">
							${walletData.usdtBalance.toFixed(2)}
						</div>
					</div>
				</div>

				{/* Last Transaction */}
				{walletData.lastTransaction && (
					<div className="bg-zinc-800/20 border border-zinc-800 p-3 rounded-lg">
						<div className="flex justify-between items-center mb-1">
							<span className="text-xs text-zinc-500">Last Transaction</span>
							<span className="text-xs text-zinc-500">{walletData.lastTransaction.time}</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								{walletData.lastTransaction.type === 'in' ? (
									<ArrowDownLeft className="h-4 w-4 text-green-500 mr-2" />
								) : (
									<ArrowUpRight className="h-4 w-4 text-red-500 mr-2" />
								)}
								<span className="text-sm">
									{walletData.lastTransaction.type === 'in' ? 'Received' : 'Sent'}
								</span>
							</div>
							<div
								className={`font-mono font-bold ${
									walletData.lastTransaction.type === 'in' ? 'text-green-500' : 'text-red-500'
								}`}
							>
								{walletData.lastTransaction.type === 'in' ? '+' : '-'}
								{walletData.lastTransaction.amount.toLocaleString()}
								{walletData.lastTransaction.token}
							</div>
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-2">
					<Button
						onClick={handleWalletAction}
						variant="outline"
						className="flex-1 justify-center border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
						size="sm"
					>
						<Plus className="h-4 w-4 mr-1" />
						Deposit
					</Button>
					<Button
						onClick={handleWalletAction}
						className="flex-1 justify-center bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
						size="sm"
					>
						<Wallet className="h-4 w-4 mr-1" />
						Open Wallet
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
