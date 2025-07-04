import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Save, Wallet, DollarSign, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import type { Transaction } from '@/types/wallet';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import type { SettingId, WalletId, UserId } from '@shared/types';

type TreasurySetting = {
	settingId: SettingId;
	treasuryWalletAddress: string;
	minWithdrawalAmount: number;
	withdrawalFeePercent: number;
	rewardDistributionDelayHours: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	updatedBy: number | null;
};

type WalletData = {
	id: WalletId;
	userId: UserId;
	username: string;
	balance: number;
};

// Admin-specific transaction type that extends the base Transaction
type AdminTransaction = Transaction & {
	walletId: WalletId;
	fromUserId: UserId | null;
	toUserId: UserId | null;
	description: string | null;
	createdAt: string;
	updatedAt: string;
};

export default function TreasuryManagement() {
	const { toast } = useToast();
	const [tab, setTab] = useState('settings');
	const [treasuryAddress, setTreasuryAddress] = useState('');
	const [minWithdrawal, setMinWithdrawal] = useState(10);
	const [withdrawalFee, setWithdrawalFee] = useState(1);
	const [distributionDelay, setDistributionDelay] = useState(24);
	const [adjustAmount, setAdjustAmount] = useState<number>(0);
	const [adjustReason, setAdjustReason] = useState<string>('');

	// Fetch treasury overview
	const { data: treasuryOverview, isLoading: isLoadingOverview } = useQuery({
		queryKey: ['/api/treasury/overview'],
		queryFn: async () => {
			const response = await fetch('/api/treasury/overview');
			if (!response.ok) {
				throw new Error('Failed to load treasury overview');
			}
			return response.json();
		}
	});

	// Fetch treasury settings
	const { data: treasurySettings, isLoading: isLoadingSettings } = useQuery<TreasurySetting[]>({
		queryKey: ['/api/admin/treasury-settings'],
		queryFn: async () => {
			const response = await fetch('/api/admin/treasury-settings');
			if (!response.ok) {
				throw new Error('Failed to load treasury settings');
			}
			return response.json();
		}
	});

	// Set form values when data is loaded
	useEffect(() => {
		if (treasurySettings && treasurySettings.length > 0) {
			const settings = treasurySettings[0];
			setTreasuryAddress(settings.treasuryWalletAddress);
			setMinWithdrawal(settings.minWithdrawalAmount);
			setWithdrawalFee(settings.withdrawalFeePercent);
			setDistributionDelay(settings.rewardDistributionDelayHours);
		}
	}, [treasurySettings]);

	// Fetch wallets
	const { data: wallets, isLoading: isLoadingWallets } = useQuery<WalletData[]>({
		queryKey: ['/api/admin/wallets'],
		queryFn: async () => {
			const response = await fetch('/api/admin/wallets');
			if (!response.ok) {
				throw new Error('Failed to load wallets');
			}
			return response.json();
		}
	});

	// Fetch recent transactions
	const { data: transactions, isLoading: isLoadingTransactions } = useQuery<AdminTransaction[]>({
		queryKey: ['/api/admin/transactions'],
		queryFn: async () => {
			const response = await fetch('/api/admin/transactions?limit=10');
			if (!response.ok) {
				throw new Error('Failed to load transactions');
			}
			return response.json();
		}
	});

	// Update treasury settings mutation
	const updateTreasurySettings = useMutation({
		mutationFn: async (settings: {
			treasuryWalletAddress: string;
			minWithdrawalAmount: number;
			withdrawalFeePercent: number;
			rewardDistributionDelayHours: number;
		}) => {
			const response = await fetch('/api/admin/treasury-settings', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(settings)
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to update treasury settings');
			}

			return response.json();
		},
		onSuccess: () => {
			toast({
				title: 'Settings updated',
				description: 'Treasury settings have been updated successfully.'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/admin/treasury-settings'] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	// Adjust treasury USDT balance mutation
	const adjustTreasuryBalance = useMutation({
		mutationFn: async (adjustData: {
			amount: number;
			type: 'credit' | 'debit';
			reason: string;
		}) => {
			const response = await fetch('/api/treasury/adjust-usdt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(adjustData)
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to adjust treasury balance');
			}

			return response.json();
		},
		onSuccess: () => {
			toast({
				title: 'Balance adjusted',
				description: 'Treasury balance has been adjusted successfully.'
			});
			// Invalidate both treasury overview and admin transactions
			queryClient.invalidateQueries({ queryKey: ['/api/treasury/overview'] });
			queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });

			// Reset form
			setAdjustAmount(0);
			setAdjustReason('');
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive'
			});
		}
	});

	// Handle settings form submission
	const handleSettingsSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateTreasurySettings.mutate({
			treasuryWalletAddress: treasuryAddress,
			minWithdrawalAmount: minWithdrawal,
			withdrawalFeePercent: withdrawalFee,
			rewardDistributionDelayHours: distributionDelay
		});
	};

	// Format date helper
	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return 'N/A';

		try {
			const date = new Date(dateString);

			// Check if the date is valid
			if (isNaN(date.getTime())) {
				return 'Invalid date';
			}

			return new Intl.DateTimeFormat('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}).format(date);
		} catch (error) {
			return 'Invalid date';
		}
	};

	// Format transaction type
	const formatTransactionType = (type: string) => {
		const typeMap: Record<string, { label: string; color: string }> = {
			TIP: { label: 'Tip', color: 'text-blue-500' },
			DEPOSIT: { label: 'Deposit', color: 'text-green-500' },
			WITHDRAWAL: { label: 'Withdrawal', color: 'text-amber-500' },
			ADMIN_ADJUST: { label: 'Admin Adjustment', color: 'text-purple-500' },
			RAIN: { label: 'Rain', color: 'text-cyan-500' },
			AIRDROP: { label: 'Airdrop', color: 'text-indigo-500' },
			SHOP_PURCHASE: { label: 'Shop Purchase', color: 'text-rose-500' },
			REWARD: { label: 'Reward', color: 'text-emerald-500' },
			REFERRAL_BONUS: { label: 'Referral Bonus', color: 'text-orange-500' },
			FEE: { label: 'Fee', color: 'text-gray-500' }
		};

		const transactionType = typeMap[type] || { label: type, color: 'text-gray-500' };
		return <span className={transactionType.color}>{transactionType.label}</span>;
	};

	// Format transaction status
	const formatTransactionStatus = (status: string) => {
		const statusMap: Record<string, { label: string; color: string }> = {
			pending: { label: 'Pending', color: 'text-yellow-500' },
			confirmed: { label: 'Confirmed', color: 'text-green-500' },
			failed: { label: 'Failed', color: 'text-red-500' },
			reversed: { label: 'Reversed', color: 'text-purple-500' },
			disputed: { label: 'Disputed', color: 'text-orange-500' }
		};

		const transactionStatus = statusMap[status] || { label: status, color: 'text-gray-500' };
		return <span className={transactionStatus.color}>{transactionStatus.label}</span>;
	};

	if (isLoadingSettings && tab === 'settings') {
		return (
			<div className="flex items-center justify-center h-full p-8">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<AdminPageShell title="Treasury Management">
			<div className="space-y-6">
				<Tabs defaultValue="settings" value={tab} onValueChange={setTab} className="space-y-4">
					<TabsList>
						<TabsTrigger value="settings">Treasury Settings</TabsTrigger>
						<TabsTrigger value="wallets">User Wallets</TabsTrigger>
						<TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
					</TabsList>

					{/* Treasury Settings Tab */}
					<TabsContent value="settings" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Treasury Wallet Configuration</CardTitle>
								<CardDescription>
									Configure the treasury wallet address and transaction settings
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSettingsSubmit} className="space-y-6">
									<div className="space-y-4">
										<div className="grid gap-2">
											<Label htmlFor="treasuryWallet">Treasury Wallet Address</Label>
											<Input
												id="treasuryWallet"
												value={treasuryAddress}
												onChange={(e) => setTreasuryAddress(e.target.value)}
												placeholder="Enter treasury wallet address"
												className="font-mono"
											/>
											<p className="text-sm text-muted-foreground">
												The wallet address used for treasury operations (deposits and withdrawals)
											</p>
										</div>

										<div className="grid gap-2">
											<Label htmlFor="minWithdrawal">Minimum Withdrawal Amount</Label>
											<Input
												id="minWithdrawal"
												type="number"
												min="0"
												step="0.01"
												value={minWithdrawal}
												onChange={(e) => setMinWithdrawal(parseFloat(e.target.value))}
											/>
											<p className="text-sm text-muted-foreground">
												Minimum amount users can withdraw (in USDT)
											</p>
										</div>

										<div className="grid gap-2">
											<Label htmlFor="withdrawalFee">Withdrawal Fee Percentage</Label>
											<Input
												id="withdrawalFee"
												type="number"
												min="0"
												max="100"
												step="0.01"
												value={withdrawalFee}
												onChange={(e) => setWithdrawalFee(parseFloat(e.target.value))}
											/>
											<p className="text-sm text-muted-foreground">
												Fee percentage charged on withdrawals
											</p>
										</div>

										<div className="grid gap-2">
											<Label htmlFor="distributionDelay">Reward Distribution Delay (Hours)</Label>
											<Input
												id="distributionDelay"
												type="number"
												min="0"
												step="1"
												value={distributionDelay}
												onChange={(e) => setDistributionDelay(parseInt(e.target.value))}
											/>
											<p className="text-sm text-muted-foreground">
												Hours to wait before distributing rewards (prevents quick withdrawal after
												receiving tips)
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button type="submit" disabled={updateTreasurySettings.isPending}>
											{updateTreasurySettings.isPending ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<Save className="mr-2 h-4 w-4" />
													Save Settings
												</>
											)}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Treasury Stats</CardTitle>
								<CardDescription>Key metrics for the treasury wallet</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoadingOverview ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="bg-card border rounded-lg p-4 flex flex-col items-center">
											<Wallet className="h-8 w-8 mb-2 text-primary" />
											<h3 className="text-xl font-semibold">Treasury Balance</h3>
											<p className="text-2xl font-bold">
												${treasuryOverview?.treasury_balance_usdt.toFixed(2) || '0.00'}
											</p>
											<p className="text-sm text-muted-foreground mt-1">Available USDT</p>
										</div>
										<div className="bg-card border rounded-lg p-4 flex flex-col items-center">
											<RefreshCw className="h-8 w-8 mb-2 text-primary" />
											<h3 className="text-xl font-semibold">DGT Balance</h3>
											<p className="text-2xl font-bold">
												{treasuryOverview?.treasury_balance.toLocaleString() || '0'}
											</p>
											<p className="text-sm text-muted-foreground mt-1">DGT Tokens</p>
										</div>
										<div className="bg-card border rounded-lg p-4 flex flex-col items-center">
											<Clock className="h-8 w-8 mb-2 text-primary" />
											<h3 className="text-xl font-semibold">Circulating</h3>
											<p className="text-2xl font-bold">
												{treasuryOverview?.percent_circulating || '0'}%
											</p>
											<p className="text-sm text-muted-foreground mt-1">Of Total Supply</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Add USDT Adjust Card */}
						<Card>
							<CardHeader>
								<CardTitle>Adjust Treasury USDT Balance</CardTitle>
								<CardDescription>Add or remove USDT from the treasury</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col md:flex-row gap-4">
									<div className="md:w-1/2 space-y-4">
										<div className="grid gap-2">
											<Label htmlFor="adjustAmount">Amount (USDT)</Label>
											<Input
												id="adjustAmount"
												type="number"
												min="0.01"
												step="0.01"
												placeholder="Enter amount in USDT"
												value={adjustAmount || ''}
												onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="adjustReason">Reason</Label>
											<Input
												id="adjustReason"
												placeholder="Enter reason for adjustment"
												value={adjustReason}
												onChange={(e) => setAdjustReason(e.target.value)}
											/>
										</div>
										<div className="flex gap-2 pt-2">
											<Button
												variant="outline"
												className="flex-1"
												disabled={
													adjustTreasuryBalance.isPending ||
													!adjustAmount ||
													adjustAmount <= 0 ||
													!adjustReason
												}
												onClick={() =>
													adjustTreasuryBalance.mutate({
														amount: adjustAmount,
														type: 'credit',
														reason: adjustReason
													})
												}
											>
												{adjustTreasuryBalance.isPending &&
												adjustTreasuryBalance.variables?.type === 'credit' ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Processing...
													</>
												) : (
													<>
														<span className="text-green-600 mr-2">+</span> Credit
													</>
												)}
											</Button>
											<Button
												variant="outline"
												className="flex-1"
												disabled={
													adjustTreasuryBalance.isPending ||
													!adjustAmount ||
													adjustAmount <= 0 ||
													!adjustReason
												}
												onClick={() =>
													adjustTreasuryBalance.mutate({
														amount: adjustAmount,
														type: 'debit',
														reason: adjustReason
													})
												}
											>
												{adjustTreasuryBalance.isPending &&
												adjustTreasuryBalance.variables?.type === 'debit' ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Processing...
													</>
												) : (
													<>
														<span className="text-red-600 mr-2">-</span> Debit
													</>
												)}
											</Button>
										</div>
									</div>
									<div className="md:w-1/2 border rounded-lg p-4 bg-muted/20">
										<h4 className="text-sm font-medium mb-2">Recent Treasury Adjustments</h4>
										{isLoadingOverview ? (
											<div className="flex items-center justify-center py-4">
												<Loader2 className="h-6 w-6 animate-spin text-primary" />
											</div>
										) : treasuryOverview?.recent_transactions &&
										  treasuryOverview.recent_transactions.length > 0 ? (
											<div className="space-y-2 max-h-60 overflow-y-auto">
												{treasuryOverview.recent_transactions.map((tx: any) => (
													<div key={tx.id} className="text-xs p-2 border rounded-md bg-card">
														<div className="flex justify-between">
															<span>{formatTransactionType(tx.type)}</span>
															<span className="font-mono">
																{typeof tx.amount === 'number' ? tx.amount.toFixed(2) : '0.00'} DGT
															</span>
														</div>
														<div className="text-muted-foreground mt-1">
															{formatDate(tx.created_at)}
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="text-center py-4 text-muted-foreground text-sm">
												No recent adjustments
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* User Wallets Tab */}
					<TabsContent value="wallets" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>User Wallets</CardTitle>
								<CardDescription>View and manage user wallet balances</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoadingWallets ? (
									<div className="flex justify-center py-8">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
									</div>
								) : (
									<Table>
										<TableCaption>List of user wallets in the system</TableCaption>
										<TableHeader>
											<TableRow>
												<TableHead>ID</TableHead>
												<TableHead>User</TableHead>
												<TableHead>Balance</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{wallets && wallets.length > 0 ? (
												wallets.map((wallet) => (
													<TableRow key={wallet.id}>
														<TableCell className="font-medium">{wallet.id}</TableCell>
														<TableCell>{wallet.username}</TableCell>
														<TableCell>
															<span className="font-semibold">
																${wallet.balance ? wallet.balance.toFixed(2) : '0.00'}
															</span>
														</TableCell>
														<TableCell className="text-right">
															<Button variant="outline" size="sm" className="ml-2">
																<DollarSign className="h-4 w-4 mr-2" />
																Adjust
															</Button>
														</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell colSpan={4} className="text-center py-6">
														No wallets found
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Recent Transactions Tab */}
					<TabsContent value="transactions" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Recent Transactions</CardTitle>
								<CardDescription>View recent transaction history</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoadingTransactions ? (
									<div className="flex justify-center py-8">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
									</div>
								) : (
									<Table>
										<TableCaption>Recent transaction history</TableCaption>
										<TableHeader>
											<TableRow>
												<TableHead>ID</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Amount</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Date</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{transactions && transactions.length > 0 ? (
												transactions.map((tx) => (
													<TableRow key={tx.id}>
														<TableCell className="font-medium">{tx.id}</TableCell>
														<TableCell>{formatTransactionType(tx.type)}</TableCell>
														<TableCell>
															<span className="font-semibold">
																${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : '0.00'}
															</span>
														</TableCell>
														<TableCell>{formatTransactionStatus(tx.status)}</TableCell>
														<TableCell>{formatDate(tx.createdAt)}</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell colSpan={5} className="text-center py-6">
														No transactions found
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</AdminPageShell>
	);
}
