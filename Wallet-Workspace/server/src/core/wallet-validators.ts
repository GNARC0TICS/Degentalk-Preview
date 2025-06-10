import { Request, Response, NextFunction } from 'express';

/**
 * Validates wallet transaction requests
 */
export function validateWalletTransaction(req: Request, res: Response, next: NextFunction) {
  const { amount, toAddress } = req.body;
  
  // Check amount
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ 
      error: 'Invalid amount',
      message: 'Transaction amount must be a positive number.'
    });
  }
  
  // Check recipient address
  if (!toAddress || typeof toAddress !== 'string' || toAddress.trim() === '') {
    return res.status(400).json({ 
      error: 'Invalid recipient',
      message: 'A valid recipient address is required.'
    });
  }
  
  next();
}

/**
 * Validates wallet address format
 */
export function validateWalletAddress(address: string): boolean {
  // Basic validation - can be expanded based on specific blockchain requirements
  return typeof address === 'string' && 
         address.trim() !== '' && 
         address.length >= 20;
}

/**
 * Validates transaction amount
 */
export function validateTransactionAmount(amount: any): boolean {
  const numAmount = Number(amount);
  return !isNaN(numAmount) && numAmount > 0;
} 