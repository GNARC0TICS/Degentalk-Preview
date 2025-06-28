import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowDown, ArrowUp, ArrowUpRight, Clock, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWallet } from '@/hooks/use-wallet';

// Types based on existing transaction history component
interface TransactionSheetProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onBack: () => void;
}

// [REFAC-DGT]
export function TransactionSheet({ isOpen, onOpenChange, onBack }: TransactionSheetProps) {
	const { transactions, isLoadingTransactions, refreshTransactions } = useWallet();
	const [activeFilter, setActiveFilter] = useState<'all' | 'deposit' | 'withdraw' | 'bill'>('all');

	// Filter transactions based on the active filter
	const filteredTransactions =
		transactions?.filter((tx) => {
			if (activeFilter === 'all') return true;
			if (activeFilter === 'deposit' && tx.type === 'deposit') return true;
			if (activeFilter === 'withdraw' && tx.type === 'withdrawal') return true;
			if (activeFilter === 'bill' && ['purchase', 'tip', 'rain'].includes(tx.type)) return true;
			return false;
		}) || [];

	const handleRefresh = () => {
		refreshTransactions?.();
	};

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent className="w-full max-w-md bg-zinc-900/95 border-zinc-800 text-white p-0 flex flex-col">
				{/* Header with back button */}
				<SheetHeader className="p-4 border-b border-zinc-800 flex flex-row items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={onBack}
						className="mr-2 text-zinc-400 hover:text-white"
					>
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<SheetTitle className="text-xl text-emerald-400 flex-1">Transactions</SheetTitle>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleRefresh}
						className="text-zinc-400 hover:text-white"
					>
						<Clock className="h-5 w-5" />
					</Button>
				</SheetHeader>

				{/* Filter tabs */}
				<div className="flex bg-zinc-800/30 rounded-full m-4 p-1">
					<Button
						variant="ghost"
						size="sm"
						className={`flex-1 rounded-full text-sm ${activeFilter === 'all' ? 'bg-emerald-800/70 text-emerald-200' : 'text-zinc-400'}`}
						onClick={() => setActiveFilter('all')}
					>
						All
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className={`flex-1 rounded-full text-sm ${activeFilter === 'deposit' ? 'bg-green-800/70 text-green-200' : 'text-zinc-400'}`}
						onClick={() => setActiveFilter('deposit')}
					>
						Deposit
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className={`flex-1 rounded-full text-sm ${activeFilter === 'withdraw' ? 'bg-purple-800/70 text-purple-200' : 'text-zinc-400'}`}
						onClick={() => setActiveFilter('withdraw')}
					>
						Withdraw
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className={`flex-1 rounded-full text-sm ${activeFilter === 'bill' ? 'bg-amber-800/70 text-amber-200' : 'text-zinc-400'}`}
						onClick={() => setActiveFilter('bill')}
					>
						Bill
					</Button>
				</div>

				{/* Column headers for desktop */}
				<div className="hidden md:grid md:grid-cols-4 px-4 py-2 text-xs text-zinc-500 font-medium">
					<div>Time</div>
					<div className="text-right">Amount</div>
					<div className="text-center">State</div>
					<div className="text-right">Transaction</div>
				</div>

				<Separator className="hidden md:block bg-zinc-800/50" />

				{/* Transaction list */}
				<ScrollArea className="flex-1">
					{isLoadingTransactions ? (
						<div className="p-8 text-center text-zinc-500">Loading transactions...</div>
					) : filteredTransactions.length === 0 ? (
						<div className="p-8 text-center text-zinc-500">No transactions found</div>
					) : (
						<div className="divide-y divide-zinc-800/50">
							{filteredTransactions.map((tx) => (
								<div
									key={tx.id}
									className="px-4 py-4 md:py-5 grid grid-cols-2 md:grid-cols-4 gap-y-2 items-center transition-colors hover:bg-zinc-800/20"
								>
									{/* Mobile layout shows date and status in first row, amount and details in second row */}

									{/* Time - Full width on mobile, normal column on desktop */}
									<div className="text-zinc-400 text-sm md:col-span-1">
										<div className="flex md:hidden items-center mb-1">
											<span className="text-xs text-zinc-500 uppercase mr-2">Time</span>
										</div>
										{formatTime(tx.timestamp)}
									</div>

									{/* Amount */}
									<div className="md:text-right flex items-center md:justify-end">
										<div className="flex md:hidden items-center mb-1">
											<span className="text-xs text-zinc-500 uppercase mr-2">Amount</span>
										</div>
										<div className="flex items-center">
											<div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center mr-2">
												{tx.type === 'deposit' ? (
													<ArrowDown className="h-3 w-3 text-green-500" />
												) : tx.type === 'withdrawal' ? (
													<ArrowUp className="h-3 w-3 text-red-500" />
												) : (
													<ArrowUpRight className="h-3 w-3 text-amber-500" />
												)}
											</div>
											<span className="text-sm font-medium">${tx.amount.toFixed(4)}</span>
										</div>
									</div>

									{/* State - On mobile, show in separate row */}
									<div className="md:text-center md:col-span-1">
										<div className="flex md:hidden items-center mb-1">
											<span className="text-xs text-zinc-500 uppercase mr-2">Status</span>
										</div>
										<Badge
											variant="outline"
											className={`
                        ${tx.status === 'completed' ? 'border-green-500/50 text-green-400' : ''}
                        ${tx.status === 'pending' ? 'border-amber-500/50 text-amber-400' : ''}
                        ${tx.status === 'failed' ? 'border-red-500/50 text-red-400' : ''}
                      `}
										>
											{tx.status}
										</Badge>
									</div>

									{/* Transaction Details - On mobile, show in separate row */}
									<div className="md:text-right flex items-center md:justify-end">
										<div className="flex md:hidden items-center mb-1">
											<span className="text-xs text-zinc-500 uppercase mr-2">Details</span>
										</div>
										<button
											className="flex items-center text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
											onClick={() => {}} // Can hook up transaction details functionality
										>
											<span>View</span>
											<ChevronLeft className="h-4 w-4 text-zinc-600 -rotate-180 ml-1" />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>

				{/* Footer with pagination */}
				<div className="p-4 border-t border-zinc-800 flex justify-end items-center">
					{/* LTC Icon and text removed */}
					<div className="flex items-center">
						<div className="text-sm text-zinc-400 mr-4">
							Total: <span className="text-white font-medium">{filteredTransactions.length}</span>
						</div>
						<div className="flex">
							<Button
								variant="ghost"
								size="icon"
								className="text-zinc-500 hover:text-white"
								disabled={true}
							>
								{' '}
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-zinc-500 hover:text-white"
								disabled={true}
							>
								{' '}
								<ChevronLeft className="h-4 w-4 -rotate-180" />
							</Button>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

// Helper function to format timestamp
function formatTime(timestamp: string | number | Date): string {
	const date = new Date(timestamp);
	const hoursNum = date.getHours();
	const hours = hoursNum.toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');

	return `${hours}:${minutes}:${seconds} ${hoursNum >= 12 ? 'PM' : 'AM'}`;
}
