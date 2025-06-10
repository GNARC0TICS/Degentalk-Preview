import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define types for API responses
interface WalletBalance {
	dgtPoints: number;
	walletAddress: string;
	walletBalanceUSDT: number;
	cryptoBalances: CryptoBalance[];
}

interface CryptoBalance {
	currency: string;
	balance: number;
	available: number;
	frozen: number;
}

interface Transaction {
	id: number;
	userId: number;
	amount: number;
	type: string;
	status: string;
	description: string;
	currency: string;
	createdAt: string;
	updatedAt: string;
}

interface DepositAddress {
	address: string;
	currency: string;
	network: string;
	qrCodeUrl?: string;
}

export function useWallet() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isDepositing, setIsDepositing] = useState(false);

	// Query transaction history
	const transactionHistoryQuery = useQuery({
		queryKey: ['/api/wallet/transactions'],
		queryFn: async () => {
			try {
				return await apiRequest<{
					transactions: Transaction[];
					total: number;
				}>({
					url: '/api/wallet/transactions'
				});
			} catch (error) {
				console.error('Error fetching transaction history:', error);
				throw error;
			}
		},
		staleTime: 30 * 1000 // 30 seconds before refetching
	});

	// Create deposit address mutation
	const createDepositAddressMutation = useMutation({
		mutationFn: async (currency: string) => {
			setIsDepositing(true);
			try {
				return await apiRequest<DepositAddress>({
					url: '/api/wallet/deposit-address',
					method: 'POST',
					data: { currency }
				});
			} catch (error) {
				console.error('Error creating deposit address:', error);
				throw error;
			} finally {
				setIsDepositing(false);
			}
		},
		onSuccess: () => {
			toast({
				variant: 'success',
				title: 'Deposit Address Created',
				description: 'Your deposit address was created successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'error',
				title: 'Error Creating Deposit Address',
				description: error?.message || 'Failed to create deposit address. Please try again.'
			});
		}
	});

	// Purchase DGT mutation
	const purchaseDgtMutation = useMutation({
		mutationFn: async (params: { cryptoAmount: number; cryptoCurrency: string }) => {
			try {
				return await apiRequest<{
					success: boolean;
					orderId: string;
					depositAddress: string;
					dgtAmount: number;
					message: string;
				}>({
					url: '/api/wallet/purchase-dgt',
					method: 'POST',
					data: {
						cryptoAmount: params.cryptoAmount,
						cryptoCurrency: params.cryptoCurrency
					}
				});
			} catch (error) {
				console.error('Error purchasing DGT:', error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
			toast({
				variant: 'success',
				title: 'DGT Purchase Initiated',
				description:
					'Your DGT purchase request has been initiated. Please check your transaction history for updates.'
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'error',
				title: 'Error Purchasing DGT',
				description: error?.message || 'Failed to purchase DGT. Please try again.'
			});
		}
	});

	// Transfer DGT mutation
	const transferDgtMutation = useMutation({
		mutationFn: async (params: { toUserId: number; amount: number; reason: string }) => {
			try {
				return await apiRequest<{
					success: boolean;
					transactionId: number;
					message: string;
				}>({
					url: '/api/wallet/transfer',
					method: 'POST',
					data: {
						toUserId: params.toUserId,
						amount: params.amount,
						reason: params.reason
					}
				});
			} catch (error) {
				console.error('Error transferring DGT:', error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
			toast({
				variant: 'success',
				title: 'DGT Transfer Complete',
				description: 'Your DGT transfer was completed successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'error',
				title: 'Error Transferring DGT',
				description: error?.message || 'Failed to transfer DGT. Please try again.'
			});
		}
	});

	return {
		// Data
		transactions: transactionHistoryQuery.data?.transactions || [],
		transactionCount: transactionHistoryQuery.data?.total || 0,

		// Status
		isLoadingTransactions: transactionHistoryQuery.isLoading,
		isDepositing,
		isCreatingAddress: createDepositAddressMutation.isPending,
		isPurchasingDgt: purchaseDgtMutation.isPending,
		isTransferringDgt: transferDgtMutation.isPending,

		// Error states
		transactionsError: transactionHistoryQuery.error,

		// Methods
		createDepositAddress: createDepositAddressMutation.mutate,
		purchaseDgt: purchaseDgtMutation.mutate,
		transferDgt: transferDgtMutation.mutate,
		refreshTransactions: () =>
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] })
	};
}
