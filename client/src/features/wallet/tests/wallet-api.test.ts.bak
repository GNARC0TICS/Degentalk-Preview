/**
 * Wallet API Service Tests
 * 
 * [REFAC-WALLET]
 * 
 * Tests for the wallet API service to ensure proper interaction with the backend.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { walletApiService } from '../services/wallet-api.service';

// Mock axios
vi.mock('axios');

describe('Wallet API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getBalance', () => {
    it('should fetch wallet balance', async () => {
      // Setup mock response
      const mockBalance = {
        dgt: 1000,
        crypto: [
          {
            currency: 'BTC',
            balance: 0.01,
            available: 0.01,
            frozen: 0,
            network: 'BTC'
          }
        ]
      };
      
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockBalance });
      
      // Call the method
      const result = await walletApiService.getBalance();
      
      // Assertions
      expect(result).toEqual(mockBalance);
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/wallet/balance'));
    });
    
    it('should handle errors', async () => {
      // Setup mock error
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));
      
      // Call and expect rejection
      await expect(walletApiService.getBalance()).rejects.toThrow('Network error');
    });
  });
  
  describe('getTransactionHistory', () => {
    it('should fetch transaction history with pagination', async () => {
      // Setup mock response
      const mockTransactions = {
        transactions: [
          {
            id: 1,
            amount: 100,
            type: 'DEPOSIT',
            status: 'confirmed',
            createdAt: '2023-01-01'
          }
        ],
        total: 1
      };
      
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockTransactions });
      
      // Call the method with pagination
      const result = await walletApiService.getTransactionHistory(2, 5);
      
      // Assertions
      expect(result).toEqual(mockTransactions);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/wallet/transactions'),
        expect.objectContaining({
          params: { page: 2, limit: 5 }
        })
      );
    });
  });
  
  describe('createDepositAddress', () => {
    it('should create deposit address for a currency', async () => {
      // Setup mock response
      const mockAddress = {
        address: '0x1234567890abcdef',
        currency: 'ETH',
        network: 'ETH',
        qrCodeUrl: 'https://example.com/qr'
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockAddress });
      
      // Call the method
      const result = await walletApiService.createDepositAddress('ETH');
      
      // Assertions
      expect(result).toEqual(mockAddress);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/wallet/deposit-address'),
        { currency: 'ETH' }
      );
    });
  });
  
  describe('createDgtPurchase', () => {
    it('should create a DGT purchase order', async () => {
      // Setup mock response
      const mockPurchaseOrder = {
        purchaseOrderId: '123',
        paymentLink: 'https://pay.example.com/order/123',
        dgtAmount: 1000,
        cryptoAmount: 10,
        cryptoCurrency: 'USDT'
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockPurchaseOrder });
      
      // Call the method
      const result = await walletApiService.createDgtPurchase(1000, 'USDT');
      
      // Assertions
      expect(result).toEqual(mockPurchaseOrder);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/wallet/dgt-purchase'),
        { dgtAmount: 1000, cryptoCurrency: 'USDT' }
      );
    });
  });
  
  describe('transferDgt', () => {
    it('should transfer DGT to another user', async () => {
      // Setup mock response
      const mockTransferResult = {
        transactionId: 1,
        senderNewBalance: 900,
        recipientNewBalance: 1100
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockTransferResult });
      
      // Call the method
      const result = await walletApiService.transferDgt(2, 100, 'Thanks for your help');
      
      // Assertions
      expect(result).toEqual(mockTransferResult);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/wallet/transfer'),
        { 
          toUserId: 2, 
          amount: 100,
          reason: 'Thanks for your help'
        }
      );
    });
  });
}); 