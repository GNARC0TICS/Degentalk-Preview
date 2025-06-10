/**
 * Wallet Hook
 * 
 * [REFAC-WALLET]
 * 
 * This hook provides access to wallet data and operations.
 * It centralizes wallet state management and API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { walletApiService, WalletBalance, Transaction, DepositAddress } from '../services/wallet-api.service';
import { useToast } from '../../../hooks/use-toast';

export interface UseWalletReturn {
  // State
  balance: WalletBalance | null;
  address: DepositAddress | null;
  transactionHistory: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refetchBalance: () => Promise<void>;
  refetchTx: () => Promise<void>;
  getDepositAddress: (currency: string) => Promise<DepositAddress | null>;
  transferDgt: (recipientId: number, amount: number, reason?: string) => Promise<boolean>;
  createDgtPurchase: (dgtAmount: number, cryptoCurrency: string) => Promise<{ purchaseOrderId: string; paymentLink: string; } | null>;
}

export function useWallet(): UseWalletReturn {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [address, setAddress] = useState<DepositAddress | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await walletApiService.getBalance();
      setBalance(data);
      setError(null);
    } catch (err) {
      setError('Failed to load wallet balance');
      toast({
        title: 'Error',
        description: 'Could not load wallet balance',
        variant: 'destructive'
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await walletApiService.getTransactionHistory(1, 10);
      setTransactionHistory(data.transactions);
      setError(null);
    } catch (err) {
      setError('Failed to load transaction history');
      toast({
        title: 'Error',
        description: 'Could not load transaction history',
        variant: 'destructive'
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Get deposit address for a currency
  const getDepositAddress = useCallback(async (currency: string): Promise<DepositAddress | null> => {
    try {
      setIsLoading(true);
      const address = await walletApiService.createDepositAddress(currency);
      setAddress(address);
      return address;
    } catch (err) {
      setError('Failed to create deposit address');
      toast({
        title: 'Error',
        description: 'Could not create deposit address',
        variant: 'destructive'
      });
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Transfer DGT to another user
  const transferDgt = useCallback(async (recipientId: number, amount: number, reason?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await walletApiService.transferDgt(recipientId, amount, reason || 'Transfer');
      
      // Refresh balance after transfer
      await fetchBalance();
      await fetchTransactionHistory();
      
      toast({
        title: 'Success',
        description: `Sent ${amount} DGT successfully`,
        variant: 'default'
      });
      
      return true;
    } catch (err) {
      setError('Failed to transfer DGT');
      toast({
        title: 'Error',
        description: 'Could not complete the transfer',
        variant: 'destructive'
      });
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalance, fetchTransactionHistory, toast]);

  // Create DGT purchase order
  const createDgtPurchase = useCallback(async (dgtAmount: number, cryptoCurrency: string) => {
    try {
      setIsLoading(true);
      const result = await walletApiService.createDgtPurchase(dgtAmount, cryptoCurrency);
      
      toast({
        title: 'Purchase Created',
        description: `Purchase order for ${dgtAmount} DGT created`,
        variant: 'default'
      });
      
      return {
        purchaseOrderId: result.purchaseOrderId,
        paymentLink: result.paymentLink
      };
    } catch (err) {
      setError('Failed to create DGT purchase');
      toast({
        title: 'Error',
        description: 'Could not create DGT purchase',
        variant: 'destructive'
      });
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data loading
  useEffect(() => {
    fetchBalance();
    fetchTransactionHistory();
  }, [fetchBalance, fetchTransactionHistory]);

  return {
    // State
    balance,
    address,
    transactionHistory,
    isLoading,
    error,

    // Actions
    refetchBalance: fetchBalance,
    refetchTx: fetchTransactionHistory,
    getDepositAddress,
    transferDgt,
    createDgtPurchase
  };
}

export default useWallet; 