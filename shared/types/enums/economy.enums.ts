/**
 * Economy Transaction Enums
 * Shared across client/server/db layers
 */

export enum TransactionType {
  TIP = 'TIP',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  ADMIN_ADJUST = 'ADMIN_ADJUST',
  RAIN = 'RAIN',
  AIRDROP = 'AIRDROP',
  SHOP_PURCHASE = 'SHOP_PURCHASE',
  REWARD = 'REWARD',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  FEE = 'FEE',
  VAULT_LOCK = 'VAULT_LOCK',
  VAULT_UNLOCK = 'VAULT_UNLOCK'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  FAILED = 'failed',
  REVERSED = 'reversed',
  DISPUTED = 'disputed'
}

export type TransactionTypeType = keyof typeof TransactionType;
export type TransactionStatusType = keyof typeof TransactionStatus;