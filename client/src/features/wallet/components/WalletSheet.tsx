import React, { useState } from 'react';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletBalanceDisplay } from './wallet-balance-display';
import { WalletAddressDisplay } from './wallet-address-display';
import TransactionHistory from './transaction-history';
import { TransactionSheet } from './TransactionSheet';
import { useWallet } from '@/hooks/use-wallet';
import {
	Wallet,
	ArrowDown,
	ArrowUp,
	CreditCard,
	History,
	QrCode,
	Copy,
	ExternalLink,
	AlertCircle,
	Inbox,
	RefreshCw,
	TrendingUp,
	DollarSign,
	Zap,
	Settings
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';

// [REFAC-DGT]
interface WalletSheetProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}

// Define interface to match expected balance structure
interface WalletBalanceData {
	walletBalanceUSDT?: number;
	dgtPoints?: number;
	walletPendingWithdrawals?: any[];
	walletAddress?: string;
}

export function WalletSheet({ isOpen, onOpenChange }: WalletSheetProps) {
	const {
		balance,
		isLoadingBalance,
		transactions,
		isLoadingTransactions,
		refreshBalance,
		refreshTransactions
	} = useWallet();

	const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('deposit');
	const [copiedAddress, setCopiedAddress] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Handle opening the transaction detail sheet
	const handleViewAllTransactions = () => {
		setIsTransactionSheetOpen(true);
	};

	// Handle closing the transaction sheet and returning to the main wallet sheet
	const handleTransactionSheetBack = () => {
		setIsTransactionSheetOpen(false);
	};

	// Handle wallet address copy
	const handleCopyAddress = () => {
		if (walletDataWithDefaults.walletAddress) {
			navigator.clipboard.writeText(walletDataWithDefaults.walletAddress);
			setCopiedAddress(true);
			setTimeout(() => setCopiedAddress(false), 2000);
		}
	};

	// Handle refresh with loading state
	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await Promise.all([refreshBalance?.(), refreshTransactions?.()]);
		} finally {
			setTimeout(() => setIsRefreshing(false), 1000); // Show success state briefly
		}
	};

	// Prepare data for wallet display
	const walletDataWithDefaults: WalletBalanceData = {
		walletBalanceUSDT: balance?.walletBalanceUSDT ?? 0,
		dgtPoints: balance?.dgtPoints ?? 0,
		pendingWithdrawals: balance?.walletPendingWithdrawals ?? [],
		walletAddress: balance?.walletAddress ?? ''
	};

	// Calculate responsive values
	const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
	const maxTransactionsToShow = isMobile ? 3 : 5;

	return (
		<>
			<Sheet open={isOpen} onOpenChange={onOpenChange}>
				<SheetContent
					className={cn(
						'bg-zinc-900/95 border-zinc-800 text-white p-0 flex flex-col overflow-hidden',
						'w-full sm:max-w-md md:max-w-lg lg:max-w-2xl'
					)}
				>
					<SheetHeader className="p-4 sm:p-6 pb-4 border-b border-zinc-800 flex-none bg-gradient-to-r from-zinc-900 to-zinc-900/90">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
									<Wallet className="h-5 w-5 text-black" />
								</div>
								<div>
									<SheetTitle className="text-xl text-emerald-400">Wallet Dashboard</SheetTitle>
									<SheetDescription className="text-zinc-400 text-sm">
										Manage your DGT balance and transactions
									</SheetDescription>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleRefresh}
									disabled={isRefreshing}
									className="text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50 transition-colors"
								>
									<RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleViewAllTransactions}
									className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 flex items-center transition-colors"
								>
									<History className="h-4 w-4 mr-1" />
									<span className="hidden sm:inline">Transactions</span>
								</Button>
							</div>
						</div>
					</SheetHeader>

					<ScrollArea className="flex-1 overflow-y-auto">
						<div className="p-4 sm:p-6 space-y-6">
							{/* Wallet Balance Display */}
							<WalletBalanceDisplay
								balance={walletDataWithDefaults}
								isLoading={isLoadingBalance}
								className="w-full"
							/>

							{/* Wallet Address Display - Desktop gets more prominence */}
							{walletDataWithDefaults.walletAddress && (
								<WalletAddressDisplay
									walletAddress={walletDataWithDefaults.walletAddress}
									copiedAddress={copiedAddress}
									onCopy={handleCopyAddress}
									className="w-full"
								/>
							)}

							{/* Enhanced Tabs for Actions */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-medium text-white flex items-center">
										<Zap className="h-4 w-4 mr-2 text-emerald-500" />
										Quick Actions
									</h3>
									<Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
										Select an action below
									</Badge>
								</div>

								<Tabs
									defaultValue="deposit"
									value={activeTab}
									onValueChange={setActiveTab}
									className="w-full"
								>
									<TabsList className="w-full grid grid-cols-3 h-12 bg-zinc-800/50 rounded-lg">
										<TabsTrigger
											value="deposit"
											className="flex items-center gap-2 data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400 transition-all"
										>
											<ArrowDown className="h-4 w-4" />
											<span className="hidden sm:inline">Deposit</span>
											<span className="sm:hidden">Deposit</span>
										</TabsTrigger>
										<TabsTrigger
											value="withdraw"
											className="flex items-center gap-2 data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400 transition-all"
										>
											<ArrowUp className="h-4 w-4" />
											<span className="hidden sm:inline">Withdraw</span>
											<span className="sm:hidden">Withdraw</span>
										</TabsTrigger>
										<TabsTrigger
											value="buy"
											className="flex items-center gap-2 data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400 transition-all"
										>
											<CreditCard className="h-4 w-4" />
											<span className="hidden sm:inline">Buy DGT</span>
											<span className="sm:hidden">Buy</span>
										</TabsTrigger>
									</TabsList>

									{/* Enhanced Tab Contents */}
									<TabsContent value="deposit" className="mt-4">
										<div className="space-y-4">
											<div className="bg-gradient-to-br from-zinc-800/40 to-zinc-800/20 rounded-lg p-4 sm:p-6 border border-zinc-700/50 backdrop-blur-sm">
												<div className="flex items-start space-x-3 mb-4">
													<div className="bg-emerald-900/30 rounded-full p-2">
														<ArrowDown className="h-5 w-5 text-emerald-500" />
													</div>
													<div className="flex-1">
														<h3 className="text-lg font-medium text-white mb-2">Deposit Funds</h3>
														<p className="text-sm text-zinc-400 leading-relaxed">
															Currently, direct crypto deposits are being updated. Please check back
															soon or use alternative methods to fund your DGT balance.
														</p>
													</div>
												</div>

												{/* Enhanced placeholder for future deposit instructions */}
												<div className="bg-black/50 rounded-lg p-6 flex flex-col items-center justify-center text-center border border-zinc-800/50">
													<div className="bg-zinc-800/50 rounded-full p-4 mb-4">
														<QrCode className="h-8 w-8 text-zinc-500" />
													</div>
													<h4 className="text-white font-medium mb-2">
														Deposit Feature Coming Soon
													</h4>
													<p className="text-zinc-500 text-sm mb-4">
														We're working on secure deposit integration
													</p>
													<div className="flex items-center space-x-2 text-xs text-zinc-600">
														<div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
														<span>Under Development</span>
													</div>
												</div>

												<div className="flex items-start space-x-2 mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-900/30">
													<AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
													<div className="text-sm text-amber-200">
														<p className="font-medium mb-1">Security Notice</p>
														<p className="text-amber-300/80">
															Always verify you're on the official Degentalk platform before making
															any transactions.
														</p>
													</div>
												</div>
											</div>
										</div>
									</TabsContent>

									{/* Enhanced Withdraw Tab */}
									<TabsContent value="withdraw" className="mt-4">
										<div className="space-y-4">
											<div className="bg-gradient-to-br from-zinc-800/40 to-zinc-800/20 rounded-lg p-4 sm:p-6 border border-zinc-700/50 backdrop-blur-sm">
												<div className="flex items-start space-x-3 mb-4">
													<div className="bg-red-900/30 rounded-full p-2">
														<ArrowUp className="h-5 w-5 text-red-500" />
													</div>
													<div className="flex-1">
														<h3 className="text-lg font-medium text-white mb-2">Withdraw Funds</h3>
														<p className="text-sm text-zinc-400 mb-4">
															Enter the amount and destination address to withdraw your funds.
														</p>
													</div>
												</div>

												<div className="space-y-4">
													<div className="bg-black/30 rounded-lg p-4 border border-zinc-800">
														<div className="flex items-center justify-between mb-3">
															<span className="text-sm text-zinc-400">Available Balance</span>
															<span className="text-lg font-medium text-white">
																${walletDataWithDefaults.walletBalanceUSDT.toFixed(2)}
															</span>
														</div>
														<div className="text-xs text-zinc-500">
															Minimum withdrawal: $10.00 • Processing time: 24 hours
														</div>
													</div>

													<Button
														disabled
														className="w-full bg-gradient-to-r from-red-600/50 to-red-700/50 border border-red-800/50 text-red-100"
													>
														<ArrowUp className="h-4 w-4 mr-2" />
														Withdraw (Coming Soon)
													</Button>
												</div>
											</div>
										</div>
									</TabsContent>

									{/* Enhanced Buy DGT Tab */}
									<TabsContent value="buy" className="mt-4">
										<div className="space-y-4">
											<div className="bg-gradient-to-br from-zinc-800/40 to-zinc-800/20 rounded-lg p-4 sm:p-6 border border-zinc-700/50 backdrop-blur-sm">
												<div className="flex items-start space-x-3 mb-4">
													<div className="bg-cyan-900/30 rounded-full p-2">
														<CreditCard className="h-5 w-5 text-cyan-500" />
													</div>
													<div className="flex-1">
														<h3 className="text-lg font-medium text-white mb-2">Buy DGT Tokens</h3>
														<p className="text-sm text-zinc-400 mb-4">
															Purchase DGT tokens to use across the platform for tips, rain, and
															more.
														</p>
													</div>
												</div>

												<div className="space-y-4">
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
														<div className="bg-black/30 rounded-lg p-3 border border-zinc-800">
															<div className="text-xs text-zinc-500 mb-1">Current Rate</div>
															<div className="text-sm font-medium text-white">1 USDT = 100 DGT</div>
														</div>
														<div className="bg-black/30 rounded-lg p-3 border border-zinc-800">
															<div className="text-xs text-zinc-500 mb-1">Your DGT Balance</div>
															<div className="text-sm font-medium text-white">
																{walletDataWithDefaults.dgtPoints.toLocaleString()}
															</div>
														</div>
													</div>

													<Button
														disabled
														className="w-full bg-gradient-to-r from-cyan-600/50 to-cyan-700/50 border border-cyan-800/50 text-cyan-100"
													>
														<CreditCard className="h-4 w-4 mr-2" />
														Buy DGT (Coming Soon)
													</Button>

													<div className="text-xs text-zinc-500 text-center">
														DGT purchases are credited instantly to your wallet
													</div>
												</div>
											</div>
										</div>
									</TabsContent>
								</Tabs>
							</div>

							{/* Enhanced Recent Transactions Section */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-medium text-white flex items-center">
										<History className="h-4 w-4 mr-2 text-emerald-500" />
										Recent Activity
									</h3>
									<div className="flex items-center space-x-2">
										{transactions && transactions.length > 0 && (
											<Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
												{transactions.length} total
											</Badge>
										)}
										<Button
											variant="outline"
											size="sm"
											onClick={handleViewAllTransactions}
											className="text-emerald-400 hover:text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/20 hover:border-emerald-800/80"
										>
											View All
										</Button>
									</div>
								</div>

								{/* Enhanced transaction display */}
								<div className="bg-zinc-800/30 rounded-lg overflow-hidden border border-zinc-800/80 backdrop-blur-sm">
									{isLoadingTransactions ? (
										<div className="p-8 text-center text-zinc-500">
											<div className="inline-block animate-spin mr-2">⟳</div>
											Loading transactions...
										</div>
									) : transactions && transactions.length > 0 ? (
										<div className="divide-y divide-zinc-800/50">
											{transactions.slice(0, maxTransactionsToShow).map((tx) => (
												<div
													key={tx.id}
													className="p-4 flex items-center justify-between transition-colors hover:bg-zinc-800/30 group"
												>
													<div className="flex items-center space-x-3 overflow-hidden flex-1">
														<div
															className={cn(
																'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
																tx.type === 'deposit' &&
																	'bg-green-900/30 text-green-500 group-hover:bg-green-900/40',
																tx.type === 'withdrawal' &&
																	'bg-red-900/30 text-red-500 group-hover:bg-red-900/40',
																(tx.type === 'purchase' || tx.type === 'tip') &&
																	'bg-amber-900/30 text-amber-500 group-hover:bg-amber-900/40'
															)}
														>
															{tx.type === 'deposit' ? (
																<ArrowDown className="h-5 w-5" />
															) : tx.type === 'withdrawal' ? (
																<ArrowUp className="h-5 w-5" />
															) : (
																<CreditCard className="h-5 w-5" />
															)}
														</div>
														<div className="min-w-0 flex-1">
															<div className="text-sm font-medium truncate text-white">
																{tx.description}
															</div>
															<div className="flex items-center space-x-2 text-xs text-zinc-500">
																<span>{new Date(tx.timestamp).toLocaleDateString()}</span>
																<span>•</span>
																<span className="capitalize">{tx.type}</span>
															</div>
														</div>
													</div>
													<div
														className={cn(
															'text-sm font-medium ml-3 flex-shrink-0 text-right',
															tx.type === 'deposit' && 'text-green-400',
															tx.type === 'withdrawal' && 'text-red-400',
															(tx.type === 'purchase' || tx.type === 'tip') && 'text-amber-400'
														)}
													>
														<div>
															{tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
														</div>
														<div className="text-xs text-zinc-500 mt-0.5">
															{new Date(tx.timestamp).toLocaleTimeString([], {
																hour: '2-digit',
																minute: '2-digit'
															})}
														</div>
													</div>
												</div>
											))}

											{transactions.length > maxTransactionsToShow && (
												<button
													className="w-full p-4 text-center text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer focus:outline-none hover:bg-emerald-900/10 transition-colors border-t border-zinc-800/50"
													onClick={handleViewAllTransactions}
												>
													<div className="flex items-center justify-center space-x-2">
														<TrendingUp className="h-4 w-4" />
														<span>
															View {transactions.length - maxTransactionsToShow} more transactions
														</span>
													</div>
												</button>
											)}
										</div>
									) : (
										<div className="p-8 text-center text-zinc-500">
											<div className="bg-zinc-800/50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
												<Inbox className="h-8 w-8 text-zinc-600" />
											</div>
											<h4 className="text-white font-medium mb-2">No Transactions Yet</h4>
											<p className="text-xs text-zinc-600">
												Your transaction history will appear here
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</ScrollArea>
				</SheetContent>
			</Sheet>

			{/* Transaction Sheet - shown when viewing all transactions */}
			<TransactionSheet
				isOpen={isTransactionSheetOpen}
				onOpenChange={setIsTransactionSheetOpen}
				onBack={handleTransactionSheetBack}
			/>
		</>
	);
}
