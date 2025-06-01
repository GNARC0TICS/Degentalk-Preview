/**
 * Payments Module
 * 
 * This is the main entry point for the payments functionality.
 * It exports modules for different payment providers and shared utilities.
 */

// Export shared utilities
export * from './shared';

// Export CCPayment module
export * as CCPayment from './ccpayment';

/**
 * Payment provider configuration
 */
export const PaymentProviders = {
  // CCPayment configuration
  ccpayment: {
    name: 'CCPayment',
    supportsDeposit: true,
    supportsWithdrawal: true,
    supportedCurrencies: ['USDT', 'BTC', 'ETH', 'USDC'],
    // Default provider
    isDefault: true
  }
};

/**
 * Get default payment provider
 */
export function getDefaultProvider(): string {
  for (const [key, config] of Object.entries(PaymentProviders)) {
    if (config.isDefault) {
      return key;
    }
  }
  return 'ccpayment'; // Fallback to CCPayment
}

/**
 * Get supported currencies for all providers
 */
export function getSupportedCurrencies(): string[] {
  const currencies = new Set<string>();
  
  Object.values(PaymentProviders).forEach(provider => {
    provider.supportedCurrencies.forEach(currency => {
      currencies.add(currency);
    });
  });
  
  return Array.from(currencies);
} 