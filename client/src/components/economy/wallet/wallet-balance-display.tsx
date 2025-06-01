import React from 'react';
import { CircleDollarSign, Award } from 'lucide-react';
import { AnimatedBalance } from './animated-balance';

export interface WalletBalanceDisplayProps {
  walletBalanceUSDT: number;
  dgtPoints: number;
  previousWalletBalanceUSDT?: number;
  previousDgtPoints?: number;
  pendingWithdrawals?: {
    amount: number;
    currency: 'USDT' | 'DGT';
    timestamp: string;
  }[];
  className?: string;
}

export function WalletBalanceDisplay({
  walletBalanceUSDT, 
  dgtPoints,
  pendingWithdrawals = [],
  className = ''
}: WalletBalanceDisplayProps) {
  // Calculate total pending withdrawals
  const pendingUSDT = pendingWithdrawals
    .filter(w => w.currency === 'USDT')
    .reduce((sum, w) => sum + w.amount, 0);
  
  const pendingDGT = pendingWithdrawals
    .filter(w => w.currency === 'DGT')
    .reduce((sum, w) => sum + w.amount, 0);
  
  return (
    <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 shadow-lg ${className}`}>
      <h3 className="text-lg font-medium text-white mb-4">Wallet Balance</h3>
      
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        {/* USDT Balance */}
        <div className="flex-1 bg-gradient-to-br from-black to-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-emerald-900/50 rounded-full p-2 mr-3">
                <CircleDollarSign className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase font-medium">USDT Balance</div>
                <div className="text-xl font-bold text-white flex items-baseline">
                  <span className="mr-1">$</span>
                  <AnimatedBalance 
                    value={walletBalanceUSDT} 
                    decimalPlaces={2}
                    className="font-bold"
                  />
                </div>
              </div>
            </div>
            
            {pendingUSDT > 0 && (
              <div className="text-right">
                <div className="text-xs text-amber-500/80 uppercase font-medium">Pending</div>
                <div className="text-sm font-medium text-amber-500">-${pendingUSDT.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* DGT Points */}
        <div className="flex-1 bg-gradient-to-br from-black to-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-amber-900/50 rounded-full p-2 mr-3">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase font-medium">DGT Balance</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedBalance 
                    value={dgtPoints} 
                    decimalPlaces={0}
                    className="font-bold"
                  />
                </div>
              </div>
            </div>
            
            {pendingDGT > 0 && (
              <div className="text-right">
                <div className="text-xs text-amber-500/80 uppercase font-medium">Pending</div>
                <div className="text-sm font-medium text-amber-500">-{pendingDGT.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-zinc-500">
        {pendingWithdrawals.length > 0 ? (
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
            <span>You have pending withdrawals that will be processed within 24 hours.</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            <span>Your wallet balance is ready to use for tips, rain, and purchases.</span>
          </div>
        )}
      </div>
    </div>
  );
}
