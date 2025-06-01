/**
 * Wallet API Service
 * 
 * This service handles all wallet-related API requests including:
 * - Balance fetching
 * - DGT transactions
 * - Crypto deposit/withdrawal
 * - Transaction history
 */

import { apiRequest } from '@/lib/queryClient';

export interface WalletBalance {
  dgt: number;
  crypto: CryptoBalance[];
}

export interface CryptoBalance {
  currency: string;
  balance: number;
  available: number;
  frozen: number;
  network?: string;
  usdValue?: number;
}

export interface Transaction {
  id: number;
  userId: number;
  fromUserId?: number;
  toUserId?: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface DgtPurchaseOrder {
  id: number;
  userId: number;
  dgtAmountRequested: number;
  cryptoAmountExpected: number;
  cryptoCurrencyExpected: string;
  ccpaymentReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface DepositAddress {
  address: string;
  currency: string;
  network: string;
  qrCodeUrl?: string;
}

/**
 * Wallet API service for interacting with wallet endpoints
 */
class WalletApiService {
  /**
   * Get wallet balance (DGT and crypto)
   * @returns Combined wallet balance
   */
  async getBalance(): Promise<WalletBalance> {
    return apiRequest<WalletBalance>({
      url: '/api/wallet/balance'
    });
  }
  
  /**
   * Get DGT transaction history
   * @param page Page number (1-based)
   * @param limit Items per page
   * @returns Paginated transaction list
   */
  async getTransactionHistory(page = 1, limit = 10): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    return apiRequest<{
      transactions: Transaction[];
      total: number;
    }>({
      url: '/api/wallet/transactions',
      params: { page, limit }
    });
  }
  
  /**
   * Create a deposit address for a specific cryptocurrency
   * @param currency Currency code (BTC, ETH, USDT_TRC20, etc.)
   * @returns Deposit address details
   */
  async createDepositAddress(currency: string): Promise<DepositAddress> {
    return apiRequest<DepositAddress>({
      url: '/api/wallet/deposit-address',
      method: 'POST',
      data: { currency }
    });
  }
  
  /**
   * Create a DGT purchase order (buy DGT with crypto)
   * @param dgtAmount Amount of DGT to purchase
   * @param cryptoCurrency Currency to pay with (USDT, BTC, ETH, etc.)
   * @returns Purchase order with payment link
   */
  async createDgtPurchase(dgtAmount: number, cryptoCurrency: string): Promise<{
    purchaseOrderId: string;
    paymentLink: string;
    dgtAmount: number;
    cryptoAmount: number;
    cryptoCurrency: string;
  }> {
    return apiRequest<{
      purchaseOrderId: string;
      paymentLink: string;
      dgtAmount: number;
      cryptoAmount: number;
      cryptoCurrency: string;
    }>({
      url: '/api/wallet/dgt-purchase',
      method: 'POST',
      data: {
        dgtAmount,
        cryptoCurrency
      }
    });
  }
  
  /**
   * Get purchase order status
   * @param orderId Purchase order ID
   * @returns Purchase order details
   */
  async getPurchaseOrderStatus(orderId: string): Promise<DgtPurchaseOrder> {
    return apiRequest<DgtPurchaseOrder>({
      url: `/api/wallet/purchase/${orderId}`
    });
  }
  
  /**
   * Request crypto withdrawal
   * @param amount Amount to withdraw
   * @param currency Currency code (USDT, BTC, etc.)
   * @param address Destination wallet address
   * @returns Withdrawal request details
   */
  async requestWithdrawal(amount: number, currency: string, address: string): Promise<{
    withdrawalId: string;
    status: string;
  }> {
    return apiRequest<{
      withdrawalId: string;
      status: string;
    }>({
      url: '/api/wallet/withdraw',
      method: 'POST',
      data: {
        amount,
        currency,
        address
      }
    });
  }
  
  /**
   * Send DGT to another user
   * @param recipientId Recipient user ID
   * @param amount Amount of DGT to send
   * @param reason Reason for the transfer
   * @returns Transfer result
   */
  async transferDgt(recipientId: number, amount: number, reason: string): Promise<{
    transactionId: number;
    senderNewBalance: number;
    recipientNewBalance: number;
  }> {
    return apiRequest<{
      transactionId: number;
      senderNewBalance: number;
      recipientNewBalance: number;
    }>({
      url: '/api/wallet/transfer',
      method: 'POST',
      data: {
        toUserId: recipientId,
        amount,
        reason
      }
    });
  }
  
  /**
   * Get supported crypto currencies
   * @returns List of supported currencies with details
   */
  async getSupportedCurrencies(): Promise<{
    code: string;
    name: string;
    networks: string[];
    isEnabled: boolean;
  }[]> {
    return apiRequest<{
      code: string;
      name: string;
      networks: string[];
      isEnabled: boolean;
    }[]>({
      url: '/api/wallet/currencies'
    });
  }
}

// Export a singleton instance
export const walletApiService = new WalletApiService(); 