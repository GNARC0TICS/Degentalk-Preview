import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/queryClient';
import type { Transaction } from '@/types/wallet';
import type { WalletBalances } from '@/types/wallet';
import { logger } from "@/lib/logger";

// Define the wallet context state type
interface WalletContextType {
	// Balance data
	dgtBalance: number;
	cryptoBalances: Record<string, number>;
	totalUsdValue: number;

	// Transaction data
	transactions: Transaction[];
	transactionCount: number;

	// Status flags
	isLoadingBalance: boolean;
	isLoadingTransactions: boolean;
	isProcessingOperation: boolean;

	// Error states
	balanceError: unknown;
	transactionsError: unknown;

	// Actions
	refreshBalance: () => void;
	refreshTransactions: () => void;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
	dgtBalance: 0,
	cryptoBalances: {},
	totalUsdValue: 0,
	transactions: [],
	transactionCount: 0,
	isLoadingBalance: false,
	isLoadingTransactions: false,
	isProcessingOperation: false,
	balanceError: null,
	transactionsError: null,
	refreshBalance: () => {},
	refreshTransactions: () => {}
});

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [isProcessingOperation, setIsProcessingOperation] = useState(false);

	// Set up global event listeners for wallet operations
	useEffect(() => {
		// Listen for wallet operation events from other components
		const handleOperationStart = () => setIsProcessingOperation(true);
		const handleOperationEnd = () => setIsProcessingOperation(false);

		window.addEventListener('wallet:operation:start', handleOperationStart);
		window.addEventListener('wallet:operation:end', handleOperationEnd);

		return () => {
			window.removeEventListener('wallet:operation:start', handleOperationStart);
			window.removeEventListener('wallet:operation:end', handleOperationEnd);
		};
	}, []);

	// Query wallet balance
	const balanceQuery = useQuery<unknown>({
		queryKey: ['/api/wallet/balance'],
		queryFn: async () => {
			try {
				return await apiRequest<WalletBalances>({
					url: '/api/wallet/balance',
					method: 'GET'
				});
			} catch (error) {
				logger.error('WalletContext', 'Error fetching wallet balance:', error);
				throw error;
			}
		},
		staleTime: 10 * 1000 // 10 seconds before refetching
	});

	// Query transaction history
	const transactionHistoryQuery = useQuery<unknown>({
		queryKey: ['/api/wallet/transactions'],
		queryFn: async () => {
			try {
				return await apiRequest<{ transactions: Transaction[]; total: number }>({
					url: '/api/wallet/transactions',
					method: 'GET'
				});
			} catch (error) {
				logger.error('WalletContext', 'Error fetching transaction history:', error);
				throw error;
			}
		},
		staleTime: 30 * 1000 // 30 seconds before refetching
	});

	// Actions
	const refreshBalance = () => {
		queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
	};

	const refreshTransactions = () => {
		queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
	};

	// Extract and process data from queries
	const dgtBalance = balanceQuery.data?.dgt || 0;
	const cryptoBalances = balanceQuery.data?.crypto || {};
	const totalUsdValue = balanceQuery.data?.totalUsdValue || 0;
	const transactions = transactionHistoryQuery.data?.transactions || [];
	const transactionCount = transactionHistoryQuery.data?.total || 0;

	// Create context value
	const contextValue: WalletContextType = {
		dgtBalance,
		cryptoBalances,
		totalUsdValue,
		transactions,
		transactionCount,
		isLoadingBalance: balanceQuery.isLoading,
		isLoadingTransactions: transactionHistoryQuery.isLoading,
		isProcessingOperation,
		balanceError: balanceQuery.error,
		transactionsError: transactionHistoryQuery.error,
		refreshBalance,
		refreshTransactions
	};

	return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
}

// Custom hook to use the wallet context
export function useWalletContext() {
	const context = useContext(WalletContext);

	if (context === undefined) {
		throw new Error('useWalletContext must be used within a WalletProvider');
	}

	return context;
}

// Hook for wallet operations that updates the context
export function useWalletOperations() {
	const queryClient = useQueryClient();

	const notifyOperationStart = () => {
		window.dispatchEvent(new Event('wallet:operation:start'));
	};

	const notifyOperationEnd = () => {
		window.dispatchEvent(new Event('wallet:operation:end'));
	};

	// Refresh all wallet-related data
	const refreshWalletData = () => {
		queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
		queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
		queryClient.invalidateQueries({ queryKey: ['/api/engagement/tip/history'] });
		queryClient.invalidateQueries({ queryKey: ['/api/engagement/rain/recent'] });
	};

	return {
		notifyOperationStart,
		notifyOperationEnd,
		refreshWalletData
	};
}
