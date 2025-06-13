import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWalletOperations } from '@/contexts/wallet-context';
import type { Transaction } from '@/types/wallet';

// Extend the Transaction interface with pending-specific properties
export interface PendingTransaction extends Omit<Transaction, 'status'> {
	status: 'pending';
	txHash?: string;
}

interface PendingTransactionsResponse {
	transactions: PendingTransaction[];
	count: number;
}

interface TransactionStatusResponse {
	id: string;
	status: string;
	timestamp: string;
	details?: any;
}

export function usePendingTransactions() {
	const queryClient = useQueryClient();
	const [isPolling, setIsPolling] = useState(false);
	const { refreshWalletData } = useWalletOperations();

	// Query pending transactions
	const pendingTransactionsQuery = useQuery({
		queryKey: ['/api/wallet/transactions/pending'],
		queryFn: async () => {
			try {
				return await apiRequest<PendingTransactionsResponse>({
					url: '/api/wallet/transactions/pending',
					method: 'GET'
				});
			} catch (error) {
				console.error('Error fetching pending transactions:', error);
				throw error;
			}
		},
		staleTime: 10 * 1000, // 10 seconds
		refetchInterval: isPolling ? 10 * 1000 : false // Only poll when isPolling is true
	});

	// Get data and states
	const pendingTransactions = pendingTransactionsQuery.data?.transactions || [];
	const isLoading = pendingTransactionsQuery.isLoading;
	const error = pendingTransactionsQuery.error;

	// Start polling for updates when new pending transactions arrive
	useEffect(() => {
		// If there are pending transactions, start polling
		if (pendingTransactions.length > 0 && !isPolling) {
			setIsPolling(true);
		}
		// If no more pending transactions, stop polling
		else if (pendingTransactions.length === 0 && isPolling) {
			setIsPolling(false);
		}
	}, [pendingTransactions.length, isPolling]);

	// Check specific transaction status (useful for UI updates)
	const checkTransactionStatus = useCallback(
		async (transactionId: string) => {
			try {
				const result = await apiRequest<TransactionStatusResponse>({
					url: `/api/wallet/transactions/${transactionId}/status`,
					method: 'GET'
				});

				// If status has changed, refresh all data
				if (result.status !== 'pending') {
					refreshWalletData();
				}

				return result;
			} catch (error) {
				console.error(`Error checking transaction status for ${transactionId}:`, error);
				throw error;
			}
		},
		[refreshWalletData]
	);

	// Force refresh
	const refreshPendingTransactions = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions/pending'] });
	}, [queryClient]);

	return {
		pendingTransactions,
		isLoading,
		error,
		isPolling,
		checkTransactionStatus,
		refreshPendingTransactions
	};
}
