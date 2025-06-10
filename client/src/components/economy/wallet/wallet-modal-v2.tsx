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
import { WalletBalanceDisplay } from './wallet-balance-display';
import { WalletAddressDisplay } from './wallet-address-display';
import { DepositButton } from './deposit-button';
import { WithdrawButton } from './withdraw-button';
import TipButton from './tip-button';
import RainButton from './rain-button';
import { BuyDgtButton } from './buy-dgt-button';
import TransactionHistory from './transaction-history';
import '../styles/wallet-animations.css'; // Assuming styles are in components/economy/styles
import { useWallet } from '@/hooks/use-wallet'; // Import useWallet hook

export interface WalletModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function WalletModalV2({ open, onOpenChange }: WalletModalProps) {
	const [activeTab, setActiveTab] = useState('overview');
	const [copiedAddress, setCopiedAddress] = useState(false);
	const {
		balance,
		isLoadingBalance,
		transactions,
		isLoadingTransactions,
		refreshBalance,
		refreshTransactions
	} = useWallet(); // Use useWallet hook
	const queryClient = useQueryClient(); // Keep queryClient for manual invalidation if needed elsewhere

	const [previousBalance, setPreviousBalance] = useState<typeof balance>(undefined);

	// Fetch transaction history
	const { data: transactionsData, isLoading: transactionsLoading } = useQuery<any[]>({
		queryKey: ['/api/wallet/transactions'],
		enabled: open && activeTab === 'history' // Only fetch when history tab is active
	});

	// Store previous wallet data for animation
	useEffect(() => {
		if (balance && previousBalance) {
			if (
				balance.dgtPoints !== previousBalance.dgtPoints ||
				balance.walletBalanceUSDT !== previousBalance.walletBalanceUSDT
			) {
				setTimeout(() => {
					setPreviousBalance(balance);
				}, 100);
			}
		} else if (balance) {
			setPreviousBalance(balance);
		}
	}, [balance, previousBalance]);

	const copyWalletAddress = () => {
		if (balance?.walletAddress) {
			navigator.clipboard.writeText(balance.walletAddress);
			setCopiedAddress(true);
			setTimeout(() => setCopiedAddress(false), 2000);
		}
	};

	// Default wallet data for rendering
	const wallet = balance || {
		dgtPoints: 0,
		walletBalanceUSDT: 0,
		walletAddress: '',
		pendingWithdrawals: []
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader className="p-5">
					<div className="flex items-center space-x-3">
						<div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_8px_rgba(0,255,170,0.3)] animate-pulse-glow">
							<Wallet className="h-5 w-5 text-black" />
						</div>
						<div>
							<DialogTitle className="text-xl text-white">Wallet Dashboard</DialogTitle>
							<DialogDescription className="text-zinc-400">
								Manage your DGT points and USDT balance
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
						<TabsContent value="overview" className="p-5 space-y-6 h-full">
							<WalletBalanceDisplay
								dgtPoints={wallet.dgtPoints}
								walletBalanceUSDT={wallet.walletBalanceUSDT}
								previousDgtPoints={previousBalance?.dgtPoints}
								previousWalletBalanceUSDT={previousBalance?.walletBalanceUSDT}
							/>
							<WalletAddressDisplay
								walletAddress={wallet.walletAddress}
								onCopy={copyWalletAddress}
								copiedAddress={copiedAddress}
							/>
							{wallet.pendingWithdrawals && wallet.pendingWithdrawals.length > 0 && (
								<div className="bg-black/30 rounded-lg p-4 border border-zinc-800 space-y-2">
									{' '}
									<h3 className="text-sm text-zinc-400 mb-2">Pending Withdrawals</h3>{' '}
									{wallet.pendingWithdrawals.map((withdrawal: any, index: number) => (
										<div key={index} className="flex items-center justify-between">
											{' '}
											<div className="flex items-center">
												{' '}
												<span className="text-zinc-300">${withdrawal.amount.toFixed(2)}</span>{' '}
											</div>{' '}
											<span className="text-xs text-zinc-500">
												{' '}
												{new Date(withdrawal.timestamp).toLocaleString()}{' '}
											</span>{' '}
										</div>
									))}{' '}
								</div>
							)}
							<div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
								{' '}
								<h3 className="text-sm text-zinc-400 mb-2">Quick Actions</h3>{' '}
								<div className="grid grid-cols-2 gap-2 mb-2">
									{' '}
									<DepositButton variant="small" onClick={() => setActiveTab('deposit')} />{' '}
									<WithdrawButton
										walletBalanceUSDT={wallet.walletBalanceUSDT}
										dgtPoints={wallet.dgtPoints}
										variant="small"
										onClick={() => setActiveTab('withdraw')}
									/>{' '}
								</div>{' '}
								<div className="grid grid-cols-2 gap-2 mb-2">
									{' '}
									<TipButton variant="small" onClick={() => setActiveTab('tip')} />{' '}
									<RainButton variant="small" onClick={() => setActiveTab('rain')} />{' '}
								</div>{' '}
								<div className="grid grid-cols-1 gap-2">
									{' '}
									<BuyDgtButton
										dgtPoints={wallet.dgtPoints}
										walletBalanceUSDT={wallet.walletBalanceUSDT}
										variant="small"
										onClick={() => setActiveTab('buy-dgt')}
									/>{' '}
								</div>{' '}
							</div>{' '}
						</TabsContent>
						<TabsContent value="deposit" className="p-5 space-y-6">
							{' '}
							<DepositButton
								walletAddress={wallet.walletAddress}
								onCopy={copyWalletAddress}
								copiedAddress={copiedAddress}
							/>{' '}
						</TabsContent>
						<TabsContent value="withdraw" className="p-5 space-y-6">
							{' '}
							<WithdrawButton walletBalanceUSDT={wallet.walletBalanceUSDT} />{' '}
						</TabsContent>
						<TabsContent value="tip" className="p-5 space-y-6">
							{' '}
							<TipButton
								dgtPoints={wallet.dgtPoints}
								walletBalanceUSDT={wallet.walletBalanceUSDT}
							/>{' '}
						</TabsContent>
						<TabsContent value="rain" className="p-5 space-y-6">
							{' '}
							<RainButton
								dgtPoints={wallet.dgtPoints}
								walletBalanceUSDT={wallet.walletBalanceUSDT}
							/>{' '}
						</TabsContent>
						<TabsContent value="buy-dgt" className="p-5 space-y-6">
							{' '}
							<BuyDgtButton
								dgtPoints={wallet.dgtPoints}
								walletBalanceUSDT={wallet.walletBalanceUSDT}
								variant="small"
								onClick={() => setActiveTab('buy-dgt')}
							/>{' '}
						</TabsContent>
						<TabsContent value="history" className="p-5">
							{' '}
							<TransactionHistory />{' '}
						</TabsContent>
					</div>
				</Tabs>

				<DialogFooter className="border-t border-zinc-800 p-4 bg-black/30">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					<Button
						variant="default"
						onClick={() => {
							refreshBalance();
							refreshTransactions();
						}}
						className="hover:shadow-[0_0_10px_rgba(5,150,105,0.5)] transition-all bg-gradient-to-r from-emerald-600 to-cyan-600"
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh Data
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
