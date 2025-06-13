import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, RefreshCw } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { WalletBalanceDisplay } from './wallet/wallet-balance-display';
import { WalletAddressDisplay } from './wallet/wallet-address-display';
import { DepositButton } from './wallet/deposit-button';
import { WithdrawButton } from './wallet/withdraw-button';
import TipButton from './wallet/tip-button';
import RainButton from './wallet/rain-button';
import { BuyDgtButton } from './wallet/buy-dgt-button';
import TransactionHistory from './wallet/transaction-history';
import type { WalletBalances } from '@/types/wallet';
import '@/styles/wallet-animations.css';

export interface WalletModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
	const [activeTab, setActiveTab] = useState('overview');
	const [copiedAddress, setCopiedAddress] = useState(false);
	const [previousWalletData, setPreviousWalletData] = useState<any>(null);
	const queryClient = useQueryClient();

	// Fetch wallet data
	const { data: walletData, isLoading: walletLoading } = useQuery<WalletBalances>({
		queryKey: ['/api/wallet/balance'],
		enabled: open
	});

	// Fetch transaction history
	const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
		queryKey: ['/api/wallet/transactions'],
		enabled: open && activeTab === 'history'
	});

	// Store previous wallet data for animation
	useEffect(() => {
		if (walletData && previousWalletData) {
			// Keep previous data until walletData changes
			if (
				walletData.dgt !== previousWalletData.dgt ||
				walletData.totalUsdValue !== previousWalletData.totalUsdValue
			) {
				// Update after 100ms to ensure animation has time to trigger
				setTimeout(() => {
					setPreviousWalletData(walletData);
				}, 100);
			}
		} else if (walletData) {
			setPreviousWalletData(walletData);
		}
	}, [walletData, previousWalletData]);

	// Default wallet data for component rendering when API data is not available yet
	const defaultWalletData: WalletBalances = {
		dgt: 0,
		crypto: {},
		totalUsdValue: 0
	};

	// Map WalletBalances to the props expected by components
	const wallet = {
		dgtPoints: walletData?.dgt || 0,
		walletBalanceUSDT: walletData?.totalUsdValue || 0,
		walletAddress: '', // Add this from the API response when available
		pendingWithdrawals: [] // Add this from the API response when available
	};

	const copyWalletAddress = () => {
		if (wallet.walletAddress) {
			navigator.clipboard.writeText(wallet.walletAddress);
			setCopiedAddress(true);
			setTimeout(() => setCopiedAddress(false), 2000);
		}
	};

	// Format transactions for display
	const transactions = transactionsData || [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
				<div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />

				<DialogHeader className="p-5">
					<div className="flex items-center space-x-3">
						<div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_8px_rgba(0,255,170,0.3)] animate-pulse-glow">
							<Wallet className="h-5 w-5 text-black" />
						</div>
						<div>
							<DialogTitle className="text-xl text-white">Wallet Dashboard</DialogTitle>
							<DialogDescription className="text-zinc-400">
								Manage your DGT and USDT balance
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Tabs
					defaultValue="overview"
					className="flex-1 overflow-hidden flex flex-col"
					value={activeTab}
					onValueChange={setActiveTab}
				>
					<TabsList className="h-12 bg-zinc-800/50 border-b border-zinc-800">
						<TabsTrigger value="overview" className="data-[state=active]:bg-black/30">
							Overview
						</TabsTrigger>
						<TabsTrigger value="deposit" className="data-[state=active]:bg-black/30">
							Deposit
						</TabsTrigger>
						<TabsTrigger value="withdraw" className="data-[state=active]:bg-black/30">
							Withdraw
						</TabsTrigger>
						<TabsTrigger value="tip" className="data-[state=active]:bg-black/30">
							Send Tip
						</TabsTrigger>
						<TabsTrigger value="rain" className="data-[state=active]:bg-black/30">
							Make It Rain
						</TabsTrigger>
						<TabsTrigger value="buy-dgt" className="data-[state=active]:bg-black/30">
							Buy DGT
						</TabsTrigger>
						<TabsTrigger value="history" className="data-[state=active]:bg-black/30">
							History
						</TabsTrigger>
					</TabsList>

					<div className="flex-1 overflow-y-auto">
						{/* Overview Tab */}
						<TabsContent value="overview" className="p-5 space-y-6 h-full">
							<WalletBalanceDisplay
								dgtPoints={wallet.dgtPoints}
								walletBalanceUSDT={wallet.walletBalanceUSDT}
								previousDgtPoints={previousWalletData?.dgtPoints}
								previousWalletBalanceUSDT={previousWalletData?.walletBalanceUSDT}
							/>

							<WalletAddressDisplay
								walletAddress={wallet.walletAddress}
								onCopy={copyWalletAddress}
								copiedAddress={copiedAddress}
							/>

							{wallet.pendingWithdrawals && wallet.pendingWithdrawals.length > 0 && (
								<div className="bg-black/30 rounded-lg p-4 border border-zinc-800 space-y-2">
									<h3 className="text-sm text-zinc-400 mb-2">Pending Withdrawals</h3>
									{wallet.pendingWithdrawals.map((withdrawal: any, index: number) => (
										<div key={index} className="flex items-center justify-between">
											<div className="flex items-center">
												<span className="text-zinc-300">${withdrawal.amount.toFixed(2)}</span>
											</div>
											<span className="text-xs text-zinc-500">
												{new Date(withdrawal.timestamp).toLocaleString()}
											</span>
										</div>
									))}
								</div>
							)}

							<div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
								<h3 className="text-sm text-zinc-400 mb-2">Quick Actions</h3>
								<div className="grid grid-cols-2 gap-2 mb-2">
									<DepositButton variant="small" onClick={() => setActiveTab('deposit')} />
									<WithdrawButton
										dgtPoints={wallet.dgtPoints}
										walletBalanceUSDT={wallet.walletBalanceUSDT}
										variant="small"
										onClick={() => setActiveTab('withdraw')}
									/>
								</div>
								<div className="grid grid-cols-2 gap-2 mb-2">
									<TipButton
										recipientId={0} // Placeholder
										recipientName="user" // Placeholder
										buttonVariant="secondary" // Corrected prop name
										buttonSize="sm" // Added size
										// onClick to change tab is handled by TabsTrigger, not the button itself
									/>
									<RainButton
										buttonSize="sm" // Use buttonSize for "small" version
										// onClick to change tab is handled by TabsTrigger, not the button itself
									/>
								</div>

								<div className="grid grid-cols-1 gap-2">
									<BuyDgtButton
										dgtPoints={wallet.dgtPoints}
										walletBalanceUSDT={wallet.walletBalanceUSDT}
										variant="small"
										onClick={() => setActiveTab('buy-dgt')}
									/>
								</div>
							</div>
						</TabsContent>

						{/* Deposit Tab */}
						<TabsContent value="deposit" className="p-5 space-y-6">
							<DepositButton />
						</TabsContent>

						{/* Withdraw Tab */}
						<TabsContent value="withdraw" className="p-5 space-y-6">
							<WithdrawButton
								dgtPoints={wallet.dgtPoints}
								walletBalanceUSDT={wallet.walletBalanceUSDT}
							/>
						</TabsContent>

						{/* Tip Tab */}
						<TabsContent value="tip" className="p-5 space-y-6">
							<TipButton
								recipientId={0} // Placeholder
								recipientName="user" // Placeholder
								// Using default variant and size
							/>
						</TabsContent>

						{/* Rain Tab */}
						<TabsContent value="rain" className="p-5 space-y-6">
							<RainButton />
						</TabsContent>

						{/* Buy DGT Tab */}
						<TabsContent value="buy-dgt" className="p-5 space-y-6">
							<BuyDgtButton
								dgtPoints={wallet.dgtPoints}
								walletBalanceUSDT={wallet.walletBalanceUSDT}
							/>
						</TabsContent>

						{/* Transaction History Tab */}
						<TabsContent value="history" className="p-5">
							<TransactionHistory />
						</TabsContent>
					</div>
				</Tabs>

				<DialogFooter className="border-t border-zinc-800 p-4 bg-black/30">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					<Button
						variant="gradient"
						leftIcon={<RefreshCw className="h-4 w-4" />}
						onClick={() => {
							queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
							queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
						}}
						className="hover:shadow-[0_0_10px_rgba(5,150,105,0.5)] transition-all"
					>
						Refresh Data
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
