/**
 * Wallet Hook
 *
 * React hook for managing wallet state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export interface WalletBalance {
	dgt: number;
	crypto: Array<{
		currency: string;
		balance: number;
		available: number;
		frozen: number;
		network?: string;
		usdValue?: number;
	}>;
}

export interface WalletTransaction {
	id: string;
	type: string;
	amount: number;
	description: string;
	status: string;
	createdAt: string;
	metadata?: Record<string, any>;
}

export interface UseWalletReturn {
	wallet: WalletBalance | null;
	transactions: WalletTransaction[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;

	// Actions
	deposit: (currency: string) => Promise<{ address: string; qrCode: string }>;
	withdraw: (amount: number, currency: string, address: string) => Promise<void>;
	tip: (userId: number, amount: number) => Promise<void>;
	purchase: (itemId: string, paymentMethod: 'DGT' | 'USDT') => Promise<void>;

	// Dev tools
	devTopUp: (amount: number, token: 'DGT' | 'USDT') => Promise<void>;
	devSimulateWebhook: (orderId: string, status: 'completed' | 'failed') => Promise<void>;
}

export const useWallet = (): UseWalletReturn => {
	const { user, isAuthenticated } = useAuth();
	const [wallet, setWallet] = useState<WalletBalance | null>(null);
	const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Fetch wallet data
	const fetchWallet = useCallback(async () => {
		if (!isAuthenticated) return;

		try {
			setIsLoading(true);
			setError(null);

			const response = await apiRequest<WalletBalance>({
				url: '/api/wallet/balance',
				method: 'GET'
			});

			setWallet(response);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch wallet'));
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated]);

	// Fetch transaction history
	const fetchTransactions = useCallback(async () => {
		if (!isAuthenticated) return;

		try {
			const response = await apiRequest<WalletTransaction[]>({
				url: '/api/wallet/transactions',
				method: 'GET',
				params: { limit: 20 }
			});

			setTransactions(response);
		} catch (err) {
			console.error('Failed to fetch transactions:', err);
		}
	}, [isAuthenticated]);

	// Initialize wallet
	const initializeWallet = useCallback(async () => {
		if (!isAuthenticated || !user) return;

		try {
			await apiRequest({
				url: '/api/wallet/dev/init',
				method: 'POST'
			});

			await fetchWallet();
		} catch (err) {
			console.error('Failed to initialize wallet:', err);
		}
	}, [isAuthenticated, user, fetchWallet]);

	// Refetch all data
	const refetch = useCallback(async () => {
		await Promise.all([fetchWallet(), fetchTransactions()]);
	}, [fetchWallet, fetchTransactions]);

	// Deposit action
	const deposit = useCallback(async (currency: string) => {
		const response = await apiRequest<{ address: string; qrCodeUrl: string }>({
			url: '/api/wallet/deposit-address',
			method: 'POST',
			data: { currency }
		});

		return {
			address: response.address,
			qrCode: response.qrCodeUrl
		};
	}, []);

	// Withdraw action
	const withdraw = useCallback(
		async (amount: number, currency: string, address: string) => {
			await apiRequest({
				url: '/api/wallet/withdraw',
				method: 'POST',
				data: { amount, currency, address }
			});

			await refetch();
		},
		[refetch]
	);

	// Tip action
	const tip = useCallback(
		async (userId: number, amount: number) => {
			await apiRequest({
				url: '/api/wallet/transfer',
				method: 'POST',
				data: {
					recipientId: userId,
					amount: amount,
					token: 'DGT'
				}
			});

			await refetch();
		},
		[refetch]
	);

	// Purchase action
	const purchase = useCallback(
		async (itemId: string, paymentMethod: 'DGT' | 'USDT') => {
			await apiRequest({
				url: '/api/shop/purchase',
				method: 'POST',
				data: { itemId, paymentMethod }
			});

			await refetch();
		},
		[refetch]
	);

	// Dev: Top up
	const devTopUp = useCallback(
		async (amount: number, token: 'DGT' | 'USDT' = 'DGT') => {
			await apiRequest({
				url: '/api/wallet/dev/topup',
				method: 'POST',
				data: { amount, token }
			});

			await refetch();
		},
		[refetch]
	);

	// Dev: Simulate webhook
	const devSimulateWebhook = useCallback(
		async (orderId: string, status: 'completed' | 'failed') => {
			await apiRequest({
				url: '/api/wallet/dev/simulate-webhook',
				method: 'POST',
				data: { orderId, status }
			});

			await refetch();
		},
		[refetch]
	);

	// Initialize on mount
	useEffect(() => {
		if (isAuthenticated && user) {
			// Check if wallet needs initialization
			fetchWallet().catch(() => {
				// If wallet fetch fails, try to initialize
				initializeWallet();
			});
			fetchTransactions();
		}
	}, [isAuthenticated, user, fetchWallet, fetchTransactions, initializeWallet]);

	return {
		wallet,
		transactions,
		isLoading,
		error,
		refetch,

		// Actions
		deposit,
		withdraw,
		tip,
		purchase,

		// Dev tools
		devTopUp,
		devSimulateWebhook
	};
};
