import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
	ArrowDownToLine,
	ArrowUpFromLine,
	Award,
	Send,
	Download as Receive,
	ShoppingCart,
	Zap,
	RefreshCw,
	TrendingUp,
	UserPlus,
	Coins
} from 'lucide-react';
import type { Transaction } from '@/features/wallet/services/wallet-api.service';

interface TransactionHistoryProps {
	history: Transaction[];
	isLoading: boolean;
	error?: any;
	onRefresh?: () => void;
}

/**
 * TransactionHistory Component
 *
 * Displays a list of wallet transactions with DGT-focused filtering
 */
export default function TransactionHistory({
	history,
	isLoading,
	error,
	onRefresh
}: TransactionHistoryProps) {
	const [filter, setFilter] = useState<string | null>(null);

	const filteredTransactions = filter
		? history.filter((tx) => {
				// Group similar transaction types for filtering
				if (filter === 'dgt') {
					return tx.type.includes('DGT') || tx.type.includes('CREDIT') || tx.type.includes('DEBIT');
				}
				if (filter === 'crypto') {
					return tx.type.includes('DEPOSIT') && tx.currency !== 'DGT';
				}
				if (filter === 'transfer') {
					return (
						tx.type.includes('TRANSFER') || tx.type.includes('TIP') || tx.type.includes('RAIN')
					);
				}
				if (filter === 'pending') {
					return tx.status.toLowerCase() === 'pending' || tx.status.toLowerCase() === 'processing';
				}
				return tx.type === filter;
			})
		: history;

	// Separate pending transactions for priority display
	const pendingTransactions = history.filter(
		(tx) => tx.status.toLowerCase() === 'pending' || tx.status.toLowerCase() === 'processing'
	);
	const hasPendingTransactions = pendingTransactions.length > 0;

	const getTransactionIcon = (type: string, amount: number) => {
		const iconClass = 'h-5 w-5';
		const isPositive = amount > 0;

		// DGT-specific transactions
		if (type.includes('DEPOSIT_CREDIT')) {
			return <TrendingUp className={`${iconClass} text-emerald-400`} />;
		}
		if (type.includes('ADMIN_CREDIT')) {
			return <UserPlus className={`${iconClass} text-blue-400`} />;
		}
		if (type.includes('ADMIN_DEBIT')) {
			return <UserPlus className={`${iconClass} text-red-400`} />;
		}
		if (type.includes('TRANSFER')) {
			return isPositive ? (
				<Receive className={`${iconClass} text-emerald-400`} />
			) : (
				<Send className={`${iconClass} text-orange-400`} />
			);
		}
		if (type.includes('TIP')) {
			return isPositive ? (
				<Receive className={`${iconClass} text-purple-400`} />
			) : (
				<Send className={`${iconClass} text-purple-400`} />
			);
		}
		if (type.includes('RAIN')) {
			return <Zap className={`${iconClass} text-yellow-400`} />;
		}
		if (type.includes('SHOP')) {
			return <ShoppingCart className={`${iconClass} text-cyan-400`} />;
		}
		if (type.includes('XP_BOOST')) {
			return <Award className={`${iconClass} text-amber-400`} />;
		}

		// Generic fallbacks
		if (isPositive) {
			return <ArrowDownToLine className={`${iconClass} text-emerald-400`} />;
		} else {
			return <ArrowUpFromLine className={`${iconClass} text-red-400`} />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'confirmed':
			case 'completed':
			case 'success':
				return 'bg-emerald-500 text-emerald-100';
			case 'pending':
			case 'processing':
				return 'bg-amber-500 text-amber-100';
			case 'failed':
			case 'cancelled':
				return 'bg-red-500 text-red-100';
			default:
				return 'bg-zinc-500 text-zinc-100';
		}
	};

	const formatAmount = (amount: number, currency: string) => {
		const absAmount = Math.abs(amount);
		if (currency === 'DGT') {
			return `${amount > 0 ? '+' : '-'}${absAmount.toFixed(2)} DGT`;
		}
		return `${amount > 0 ? '+' : '-'}$${absAmount.toFixed(2)}`;
	};

	const formatTransactionDescription = (tx: Transaction) => {
		// Enhanced descriptions for DGT transactions
		if (tx.type.includes('DEPOSIT_CREDIT')) {
			const originalToken = tx.metadata?.originalToken || 'Crypto';
			const usdtAmount = tx.metadata?.usdtAmount || 'Unknown';
			return `${originalToken} deposit converted to DGT (${usdtAmount} USDT)`;
		}
		if (tx.type.includes('ADMIN_CREDIT')) {
			return tx.metadata?.reason || 'Admin credit';
		}
		if (tx.type.includes('ADMIN_DEBIT')) {
			return tx.metadata?.reason || 'Admin debit';
		}
		if (tx.type.includes('TRANSFER')) {
			const isReceived = tx.amount > 0;
			const note = tx.metadata?.reason || tx.metadata?.note;
			return `DGT ${isReceived ? 'received' : 'sent'}${note ? ` - ${note}` : ''}`;
		}

		// Fallback to description or generate one
		return tx.description || `${tx.type} transaction`;
	};

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Transaction History</CardTitle>
				<div className="flex items-center space-x-2">
					<div className="flex items-center space-x-1">
						<Button
							variant="ghost"
							size="sm"
							className={!filter ? 'bg-accent' : ''}
							onClick={() => setFilter(null)}
						>
							All
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={filter === 'dgt' ? 'bg-accent' : ''}
							onClick={() => setFilter('dgt')}
						>
							DGT
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={filter === 'crypto' ? 'bg-accent' : ''}
							onClick={() => setFilter('crypto')}
						>
							Crypto
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={filter === 'transfer' ? 'bg-accent' : ''}
							onClick={() => setFilter('transfer')}
						>
							Transfers
						</Button>
						{hasPendingTransactions && (
							<Button
								variant="ghost"
								size="sm"
								className={`${filter === 'pending' ? 'bg-accent' : ''} text-amber-400 border-amber-600/30`}
								onClick={() => setFilter('pending')}
							>
								<Clock className="h-3 w-3 mr-1" />
								Pending ({pendingTransactions.length})
							</Button>
						)}
					</div>
					{onRefresh && (
						<Button variant="ghost" size="sm" onClick={onRefresh} title="Refresh transactions">
							<RefreshCw className="h-4 w-4" />
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : error ? (
					<div className="text-center py-8">
						<p className="text-red-400 mb-4">Failed to load transactions</p>
						{onRefresh && (
							<Button variant="outline" onClick={onRefresh} size="sm">
								<RefreshCw className="w-4 h-4 mr-2" />
								Retry
							</Button>
						)}
					</div>
				) : history.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Coins className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
						<p>No transactions found</p>
						<p className="text-sm text-zinc-500 mt-1">Your transaction history will appear here</p>
					</div>
				) : (
					<ScrollArea className="h-[420px] pr-4">
						<div className="space-y-4">
							{filteredTransactions.map((transaction) => {
								const isPending =
									transaction.status.toLowerCase() === 'pending' ||
									transaction.status.toLowerCase() === 'processing';
								return (
									<div
										key={transaction.id}
										className={`flex items-start space-x-4 rounded-md border p-3 transition-colors ${
											isPending
												? 'border-amber-600/50 bg-amber-900/20 hover:bg-amber-800/30 animate-pulse'
												: 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/30'
										}`}
									>
										<div className="mt-px">
											{getTransactionIcon(transaction.type, transaction.amount)}
										</div>
										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<p className="text-sm font-medium text-zinc-200">
													{formatTransactionDescription(transaction)}
												</p>
												<div className="flex items-center space-x-2">
													<Badge
														variant="outline"
														className={`text-xs ${getStatusColor(transaction.status)}`}
													>
														{transaction.status}
													</Badge>
												</div>
											</div>
											<div className="flex items-center justify-between text-sm">
												<div className="text-xs text-zinc-400">
													{new Date(transaction.createdAt).toLocaleDateString()} at{' '}
													{new Date(transaction.createdAt).toLocaleTimeString()}
												</div>
												<div className="flex flex-col items-end">
													<span
														className={`font-medium ${transaction.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}
													>
														{formatAmount(transaction.amount, transaction.currency)}
													</span>
													{transaction.metadata && (
														<span className="text-xs text-zinc-500">
															{transaction.type.replace(/_/g, ' ').toLowerCase()}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
