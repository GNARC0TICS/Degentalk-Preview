/**
 * CCPayment Deposit Service
 * 
 * This module provides deposit functionality using CCPayment
 */

import { ccpaymentClient } from './ccpayment-client';
import { generateOrderId } from './utils';
import { SupportedCurrency } from './types';

/**
 * Deposit request parameters
 */
export interface CreateDepositParams {
  userId: number;
  amount: number;
  currency: SupportedCurrency;
  productName?: string;
  metadata?: Record<string, any>;
}

/**
 * Deposit response data
 */
export interface DepositResponse {
  paymentLink: string;
  orderId: string;
  amount: number;
  currency: string;
  createdAt: string;
}

/**
 * Creates a deposit request and returns a payment link
 * 
 * @param params - Deposit parameters
 * @returns Deposit response with payment link
 */
export async function createDeposit(params: CreateDepositParams): Promise<DepositResponse> {
  try {
    // Generate unique order ID
    const orderId = generateOrderId(params.userId, 'DEP');
    
    // TODO: CCPayment logic
    // In the integration phase, update this to use real API URLs and callbacks
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://example.com';
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.example.com';
    
    // Create a payment link
    const paymentLink = await ccpaymentClient.createDepositLink({
      amount: params.amount,
      currency: params.currency,
      orderId: orderId,
      productName: params.productName || 'DGT Tokens',
      redirectUrl: `${baseUrl}/wallet/deposit-success?orderId=${orderId}`,
      notifyUrl: `${apiUrl}/api/ccpayment/webhook`
    });
    
    // Record the deposit transaction in the database via API
    // TODO: Store deposit transaction through API
    
    return {
      paymentLink,
      orderId,
      amount: params.amount,
      currency: params.currency,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating deposit:', error);
    throw new Error(`Failed to create deposit: ${error.message}`);
  }
}

/**
 * Checks the status of a deposit
 * 
 * @param orderId - The order ID to check
 * @returns Current status of the deposit
 */
export async function checkDepositStatus(orderId: string): Promise<{
  status: string;
  isComplete: boolean;
  transactionHash?: string;
}> {
  try {
    // TODO: CCPayment logic
    // In the integration phase, update this to use real status checking
    const status = await ccpaymentClient.getTransactionStatus(orderId);
    
    return {
      status: status.status,
      isComplete: status.status === 'completed',
      transactionHash: status.txHash
    };
  } catch (error) {
    console.error('Error checking deposit status:', error);
    throw new Error(`Failed to check deposit status: ${error.message}`);
  }
} 