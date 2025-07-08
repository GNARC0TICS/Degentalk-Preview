import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters'; // Assuming this exists and works
// Removed unused Tabs, TabsContent, TabsList, TabsTrigger from '@/components/ui/tabs'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { AdminPageShell } from '@/components/admin/layout/AdminPageShell'; // Import TabConfig
import type { TabConfig } from '@/components/admin/layout/AdminPageShell'; // Type-only import
import { AdminDataTable } from '@/components/admin/common/AdminDataTable';
import type { ColumnDef } from '@/components/admin/layout/EntityTable'; // Type-only import
import ManualDgtAdjustmentDialog from '@/components/admin/forms/wallets/ManualDgtAdjustmentDialog';
import { MockWebhookTrigger } from '@/components/admin/wallet/mock-webhook-trigger';
import { type UserId } from "@shared/types/ids";

// Type definitions
interface WalletStats {
	totalDgtCirculation: number;
	activeWalletCount: number;
	transactionsLast24h: number;
	dgtPrice?: number;
	dgtTradingVolume24h?: number;
}

export interface TopUser {
	// Export for potential use in dialog or other components
	id: UserId;
	username: string;
	dgtBalance: number;
	lastActive: string;
}

interface TopUsersResponse {
	users: TopUser[];
	total: number; // Assuming API provides total for pagination if needed
}

export interface Transaction {
	// Export for potential use
	id: UserId;
	type: string;
	amount: number;
	currency: string;
	userId: UserId;
	username: string;
	timestamp: string;
	status: string;
}

interface TransactionsResponse {
	transactions: Transaction[];
	total: number; // Assuming API provides total for pagination if needed
}

interface CCPaymentStatus {
	apiStatus: 'connected' | 'disconnected';
	lastWebhookReceived: string | null;
	pendingTransactionCount: number;
	lastCheck: string;
}

interface DgtAdjustmentResponse {
	success: boolean;
	transactionId?: string; // Made optional as it might not always be present on error
	newBalance?: number; // Made optional
	message?: string; // For error messages
}

export default function AdminWalletsPage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState('overview'); // Default to overview or users

	// Dialog states
	const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
	const [selectedUserForAdjustment, setSelectedUserForAdjustment] = useState<TopUser | null>(null);
	const [adjustmentType, setAdjustmentType] = useState<'grant' | 'deduct'>('grant');

	// API Queries
	const { data: stats, isLoading: isLoadingStats } = useQuery<WalletStats>({
		queryKey: ['/api/admin/wallet/stats'],
		queryFn: () => apiRequest({ url: '/api/admin/wallet/stats', method: 'GET' })
	});

	const { data: topUsersData, isLoading: isLoadingTopUsers } = useQuery<TopUsersResponse>({
		queryKey: ['/api/admin/wallet/top-users'],
		queryFn: () => apiRequest({ url: '/api/admin/wallet/top-users', method: 'GET' })
	});

	const { data: recentTransactionsData, isLoading: isLoadingTransactions } =
		useQuery<TransactionsResponse>({
			queryKey: ['/api/admin/wallet/recent-transactions'],
			queryFn: () => apiRequest({ url: '/api/admin/wallet/recent-transactions', method: 'GET' })
		});

	const { data: ccpaymentStatus, isLoading: isLoadingCCPayment } = useQuery<CCPaymentStatus>({
		queryKey: ['/api/admin/wallet/ccpayment-status'],
		queryFn: () => apiRequest({ url: '/api/admin/wallet/ccpayment-status', method: 'GET' })
	});

	// Mutation for DGT adjustment
	const manualAdjustMutation = useMutation<
		DgtAdjustmentResponse,
		Error, // Explicitly type error
		{ userId: string; amount: number; reason: string; type: 'grant' | 'deduct' }
	>({
		mutationFn: async (params) => {
			const endpoint =
				params.type === 'grant' ? '/api/admin/wallet/grant-dgt' : '/api/admin/wallet/deduct-dgt';
			return apiRequest({ url: endpoint, method: 'POST', data: params });
		},
		onSuccess: (data) => {
			if (data.success) {
				queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet/stats'] });
				queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet/top-users'] });
				queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet/recent-transactions'] });
				toast({
					title: 'Balance Updated',
					description: `User DGT balance ${adjustmentType === 'grant' ? 'increased' : 'decreased'} successfully. New balance: ${formatCurrency(data.newBalance || 0, 'DGT')}`
				});
				setIsManualDialogOpen(false);
				setSelectedUserForAdjustment(null);
			} else {
				// Handle cases where API returns success:false with a message
				toast({
					variant: 'destructive',
					title: 'Update Failed',
					description: data.message || 'Failed to update DGT balance.'
				});
			}
		},
		onError: (error) => {
			toast({
				variant: 'destructive',
				title: 'Error Updating Balance',
				description: error.message || 'An unexpected error occurred. Please try again.'
			});
		}
	});

	const handleOpenAdjustmentDialog = (user?: TopUser, type: 'grant' | 'deduct' = 'grant') => {
		setSelectedUserForAdjustment(user || null);
		setAdjustmentType(type);
		setIsManualDialogOpen(true);
	};

	// Columns for Top Users Table
	const topUsersColumns: ColumnDef<TopUser>[] = [
		{ key: 'id', header: 'User ID' },
		{ key: 'username', header: 'Username' },
		{
			key: 'dgtBalance',
			header: 'DGT Balance',
			render: (user) => formatCurrency(user.dgtBalance, 'DGT')
		},
		{
			key: 'lastActive',
			header: 'Last Active',
			render: (user) => new Date(user.lastActive).toLocaleDateString()
		}
	];

	const renderTopUserActions = (user: TopUser) => (
		<Button variant="outline" size="sm" onClick={() => handleOpenAdjustmentDialog(user, 'grant')}>
			Adjust Balance
		</Button>
	);

	// Columns for Recent Transactions Table
	const transactionsColumns: ColumnDef<Transaction>[] = [
		{ key: 'id', header: 'ID' },
		{
			key: 'type',
			header: 'Type',
			render: (tx) => (
				<Badge variant={tx.type === 'grant' || tx.type === 'deposit' ? 'default' : 'secondary'}>
					{tx.type}
				</Badge>
			)
		},
		{ key: 'amount', header: 'Amount', render: (tx) => formatCurrency(tx.amount, tx.currency) },
		{ key: 'username', header: 'User', render: (tx) => `${tx.username} (ID: ${tx.userId})` },
		{
			key: 'timestamp',
			header: 'Timestamp',
			render: (tx) => new Date(tx.timestamp).toLocaleString()
		},
		{
			key: 'status',
			header: 'Status',
			render: (tx) => (
				<Badge
					variant={
						tx.status === 'completed'
							? 'success'
							: tx.status === 'failed'
								? 'destructive'
								: 'outline'
					}
				>
					{tx.status}
				</Badge>
			)
		}
	];

	// Tab Content Components
	const OverviewTabContent = () => (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{' '}
			{/* Adjusted lg:grid-cols-3 as there are 3 cards */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Total DGT In Circulation</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingStats ? (
						<Skeleton className="h-8 w-24" />
					) : (
						<div className="text-2xl font-bold">
							{formatCurrency(stats?.totalDgtCirculation || 0, 'DGT')}
						</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingStats ? (
						<Skeleton className="h-8 w-24" />
					) : (
						<div className="text-2xl font-bold">
							{stats?.activeWalletCount?.toLocaleString() || 0}
						</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">DGT Transactions (24h)</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingStats ? (
						<Skeleton className="h-8 w-24" />
					) : (
						<div className="text-2xl font-bold">
							{stats?.transactionsLast24h?.toLocaleString() || 0}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);

	const UserBalancesTabContent = () => (
		<Card>
			<CardHeader>
				<CardTitle>Top User Balances</CardTitle>
				<CardDescription>
					Users with the highest DGT balances. Click "Adjust Balance" to modify.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminDataTable
					columns={topUsersColumns}
					data={topUsersData?.users || []}
					isLoading={isLoadingTopUsers}
					renderActions={renderTopUserActions}
					emptyStateMessage="No user balances found."
				/>
			</CardContent>
		</Card>
	);

	const RecentTransactionsTabContent = () => (
		<Card>
			<CardHeader>
				<CardTitle>Recent Transactions</CardTitle>
				<CardDescription>Last 20 DGT transactions across the platform.</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminDataTable
					columns={transactionsColumns}
					data={recentTransactionsData?.transactions || []}
					isLoading={isLoadingTransactions}
					emptyStateMessage="No recent transactions found."
				/>
			</CardContent>
			<CardFooter className="justify-end">
				<Button variant="outline">Export Transactions</Button>
			</CardFooter>
		</Card>
	);

	const CCPaymentTabContent = () => (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>CCPayment Integration Status</CardTitle>
					<CardDescription>Monitor the status of the CCPayment integration.</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingCCPayment ? (
						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex justify-between items-center p-4 border rounded-md">
								<div>
									<h3 className="font-medium">API Connection</h3>
									<p className="text-sm text-muted-foreground">
										Status of the CCPayment API connection
									</p>
								</div>
								<Badge
									variant={ccpaymentStatus?.apiStatus === 'connected' ? 'success' : 'destructive'}
								>
									{ccpaymentStatus?.apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
								</Badge>
							</div>
							<div className="flex justify-between items-center p-4 border rounded-md">
								<div>
									<h3 className="font-medium">Webhook Status</h3>
									<p className="text-sm text-muted-foreground">Last webhook received</p>
								</div>
								<div className="text-right">
									<Badge variant={ccpaymentStatus?.lastWebhookReceived ? 'success' : 'destructive'}>
										{ccpaymentStatus?.lastWebhookReceived ? 'Active' : 'Not Received'}
									</Badge>
									{ccpaymentStatus?.lastWebhookReceived && (
										<p className="text-xs text-muted-foreground mt-1">
											{new Date(ccpaymentStatus.lastWebhookReceived).toLocaleString()}
										</p>
									)}
								</div>
							</div>
							<div className="flex justify-between items-center p-4 border rounded-md">
								<div>
									<h3 className="font-medium">Pending Transactions</h3>
									<p className="text-sm text-muted-foreground">
										CCPayment transactions awaiting confirmation
									</p>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold">
										{ccpaymentStatus?.pendingTransactionCount || 0}
									</p>
								</div>
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter className="justify-between">
					<div className="text-sm text-muted-foreground">
						Last API check:{' '}
						{ccpaymentStatus?.lastCheck
							? new Date(ccpaymentStatus.lastCheck).toLocaleString()
							: 'Never'}
					</div>
					<Button
						variant="outline"
						onClick={() =>
							queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet/ccpayment-status'] })
						}
					>
						Refresh Status
					</Button>
				</CardFooter>
			</Card>
			<MockWebhookTrigger />
		</div>
	);

	const tabsConfig: TabConfig[] = [
		{ value: 'overview', label: 'Overview', content: <OverviewTabContent /> },
		{ value: 'users', label: 'User Balances', content: <UserBalancesTabContent /> },
		{
			value: 'transactions',
			label: 'Recent Transactions',
			content: <RecentTransactionsTabContent />
		},
		{ value: 'ccpayment', label: 'CCPayment Status', content: <CCPaymentTabContent /> }
	];

	return (
		<React.Fragment>
			<AdminPageShell
				title="Wallet Management"
				pageActions={
					<Button onClick={() => handleOpenAdjustmentDialog(undefined, 'grant')}>
						Manual DGT Adjustment
					</Button>
				}
				tabsConfig={tabsConfig}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				{/* Fallback content if no tabs or specific layout needed outside tabs */}
			</AdminPageShell>
			{/* Dialog for manual DGT adjustment */}
			<ManualDgtAdjustmentDialog
				isOpen={isManualDialogOpen}
				onClose={() => {
					setIsManualDialogOpen(false);
					setSelectedUserForAdjustment(null);
				}}
				onSubmit={async (data) => manualAdjustMutation.mutate(data)}
				isSubmitting={manualAdjustMutation.isPending}
				initialUserId={selectedUserForAdjustment?.id || ''}
				initialTransactionType={adjustmentType}
			/>
		</React.Fragment>
	);
}
