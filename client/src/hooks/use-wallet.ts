import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApiService } from '@/features/wallet/services/wallet-api.service';
import { apiRequest } from '@/utils/api-request';
import { useToast } from '@/hooks/use-toast';
import { formatDgt, parseDgt, formatUsd } from '@/utils/format';

// Import types from wallet API service
import type {
	WalletBalance,
	CryptoBalance,
	Transaction,
	DepositAddress
} from '@/features/wallet/services/wallet-api.service';
import type { UserId } from '@shared/types/ids';
import { logger } from "@/lib/logger";

export function useWallet() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isDepositing, setIsDepositing] = useState(false);

	// Query wallet balance
	const balanceQuery = useQuery({
		queryKey: ['/api/wallet/balances'],
		queryFn: () => walletApiService.getBalance(),
		staleTime: 30 * 1000 // 30 seconds before refetching
	});

	// ---------- COMPATIBILITY LAYER ----------
	const compatBalance: WalletBalance | undefined = useMemo(() => {
		const raw = balanceQuery.data;
		if (!raw) return undefined;

		// If legacy shape already present, return as-is
		if (typeof raw.dgt === 'object' && raw.crypto) return raw as any;

		return {
			...raw,
			dgt: { balance: (raw as any).dgtBalance ?? 0 },
			crypto: raw.cryptoBalances?.map((c) => ({ balance: c.balance })) ?? []
		} as any;
	}, [balanceQuery.data]);

	// Query transaction history
	const transactionHistoryQuery = useQuery({
		queryKey: ['/api/wallet/transactions'],
		queryFn: () => walletApiService.getTransactionHistory(),
		staleTime: 30 * 1000 // 30 seconds before refetching
	});

	// Query deposit addresses
	const depositAddressesQuery = useQuery({
		queryKey: ['/api/wallet/deposit-addresses'],
		queryFn: () => walletApiService.getDepositAddresses(),
		staleTime: 5 * 60 * 1000 // 5 minutes before refetching
	});

	// Query wallet configuration
	const walletConfigQuery = useQuery({
		queryKey: ['/api/wallet/config'],
		queryFn: () => walletApiService.getWalletConfig(),
		staleTime: 60 * 1000 // 1 minute before refetching
	});

	// Refresh deposit addresses mutation (they're auto-generated)
	const refreshDepositAddressesMutation = useMutation({
		mutationFn: async () => {
			return walletApiService.getDepositAddresses();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/deposit-addresses'] });
			toast({
				variant: 'default',
				title: 'Addresses Refreshed',
				description: 'Your deposit addresses have been refreshed.'
			});
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error Refreshing Addresses',
				description: error?.message || 'Failed to refresh deposit addresses. Please try again.'
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
				logger.error('useWallet', 'Error purchasing DGT:', error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
			toast({
				variant: 'default',
				title: 'DGT Purchase Initiated',
				description:
					'Your DGT purchase request has been initiated. Please check your transaction history for updates.'
			});
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error Purchasing DGT',
				description: error?.message || 'Failed to purchase DGT. Please try again.'
			});
		}
	});

	// Transfer DGT mutation
	const transferDgtMutation = useMutation({
		mutationFn: async (params: { toUserId: string; amount: number; note?: string }) => {
			return walletApiService.transferDgt(params.toUserId, params.amount, params.note);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/balances'] });
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
			toast({
				variant: 'default',
				title: 'DGT Transfer Complete',
				description: 'Your DGT transfer was completed successfully.'
			});
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error Transferring DGT',
				description: error?.message || 'Failed to transfer DGT. Please try again.'
			});
		}
	});

	return {
		// Data
		balance: compatBalance,
		transactions: transactionHistoryQuery.data?.transactions || [],
		transactionCount: transactionHistoryQuery.data?.total || 0,
		depositAddresses: depositAddressesQuery.data || [],
		walletConfig: walletConfigQuery.data,

		// Status
		isLoadingBalance: balanceQuery.isLoading,
		isLoadingTransactions: transactionHistoryQuery.isLoading,
		isLoadingDepositAddresses: depositAddressesQuery.isLoading,
		isLoadingConfig: walletConfigQuery.isLoading,
		isDepositing,
		isRefreshingAddresses: refreshDepositAddressesMutation.isPending,
		isPurchasingDgt: purchaseDgtMutation.isPending,
		isTransferringDgt: transferDgtMutation.isPending,

		// Error states
		balanceError: balanceQuery.error,
		transactionsError: transactionHistoryQuery.error,
		depositAddressesError: depositAddressesQuery.error,
		configError: walletConfigQuery.error,

		// Methods
		refreshDepositAddresses: refreshDepositAddressesMutation.mutate,
		purchaseDgt: purchaseDgtMutation.mutate,
		transferDgt: transferDgtMutation.mutate,
		refreshBalance: () => queryClient.invalidateQueries({ queryKey: ['/api/wallet/balances'] }),
		refreshTransactions: () =>
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] }),
		refreshConfig: () => queryClient.invalidateQueries({ queryKey: ['/api/wallet/config'] })
	};
}
