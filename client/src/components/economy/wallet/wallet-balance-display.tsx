import React from 'react';
import { CircleDollarSign, Award, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import { AnimatedBalance } from './animated-balance';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  previousWalletBalanceUSDT,
  previousDgtPoints,
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

  // Calculate change indicators
  const usdtChange = previousWalletBalanceUSDT ? walletBalanceUSDT - previousWalletBalanceUSDT : 0;
  const dgtChange = previousDgtPoints ? dgtPoints - previousDgtPoints : 0;
  
  return (
    <div className={cn(
      "bg-gradient-to-br from-black/40 to-zinc-900/40 rounded-xl p-4 sm:p-6 border border-zinc-800/80 shadow-xl backdrop-blur-sm",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center mr-3 shadow-lg">
              <CircleDollarSign className="h-4 w-4 text-black" />
            </div>
            Wallet Balance
          </h3>
          <p className="text-sm text-zinc-400 mt-1">Your available funds and DGT tokens</p>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          {pendingWithdrawals.length > 0 ? (
            <Badge variant="outline" className="text-amber-400 border-amber-600/30 bg-amber-900/20">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          ) : (
            <Badge variant="outline" className="text-emerald-400 border-emerald-600/30 bg-emerald-900/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Available
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* USDT Balance Card */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 rounded-lg p-4 sm:p-5 border border-emerald-800/30 hover:border-emerald-700/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-900/50 rounded-full p-2.5 group-hover:bg-emerald-900/70 transition-colors">
                <CircleDollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-emerald-400/80 uppercase font-medium tracking-wide">USDT Balance</div>
                <div className="text-2xl sm:text-3xl font-bold text-white flex items-baseline">
                  <span className="text-lg mr-1">$</span>
                  <AnimatedBalance 
                    value={walletBalanceUSDT} 
                    decimalPlaces={2}
                    className="font-bold"
                  />
                </div>
              </div>
            </div>
            
            {/* Change indicator for USDT */}
            {usdtChange !== 0 && (
              <div className={cn(
                "flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full",
                usdtChange > 0 ? "text-green-400 bg-green-900/30" : "text-red-400 bg-red-900/30"
              )}>
                {usdtChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>${Math.abs(usdtChange).toFixed(2)}</span>
              </div>
            )}
          </div>
          
          {/* Pending USDT withdrawals */}
          {pendingUSDT > 0 && (
            <div className="mt-3 pt-3 border-t border-emerald-800/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-400/80 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Withdrawal
                </span>
                <span className="text-amber-400 font-medium">-${pendingUSDT.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Available after pending */}
          <div className="mt-3 pt-3 border-t border-emerald-800/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-400/80">Available for Use</span>
              <span className="text-emerald-400 font-medium">
                ${(walletBalanceUSDT - pendingUSDT).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        {/* DGT Card */}
        <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 rounded-lg p-4 sm:p-5 border border-amber-800/30 hover:border-amber-700/50 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-900/50 rounded-full p-2.5 group-hover:bg-amber-900/70 transition-colors">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-amber-400/80 uppercase font-medium tracking-wide">DGT</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  <AnimatedBalance 
                    value={dgtPoints} 
                    decimalPlaces={0}
                    className="font-bold"
                  />
                </div>
              </div>
            </div>
            
            {/* Change indicator for DGT */}
            {dgtChange !== 0 && (
              <div className={cn(
                "flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full",
                dgtChange > 0 ? "text-green-400 bg-green-900/30" : "text-red-400 bg-red-900/30"
              )}>
                {dgtChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(dgtChange).toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {/* Pending DGT withdrawals */}
          {pendingDGT > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-800/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-400/80 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Withdrawal
                </span>
                <span className="text-amber-400 font-medium">-{pendingDGT.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          {/* Available after pending */}
          <div className="mt-3 pt-3 border-t border-amber-800/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-400/80">Available DGT</span>
              <span className="text-amber-400 font-medium">
                {(dgtPoints - pendingDGT).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced status message */}
      <div className="mt-6 pt-4 border-t border-zinc-800/50">
        {pendingWithdrawals.length > 0 ? (
          <div className="flex items-start space-x-3 p-3 bg-amber-900/20 rounded-lg border border-amber-900/30">
            <div className="bg-amber-500/20 rounded-full p-1 mt-0.5">
              <Clock className="h-3 w-3 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200 mb-1">
                Withdrawal Processing
              </p>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                You have {pendingWithdrawals.length} pending withdrawal{pendingWithdrawals.length > 1 ? 's' : ''} 
                that will be processed within 24 hours. Funds will be available once processing is complete.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-900/30">
            <div className="bg-emerald-500/20 rounded-full p-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-200 mb-1">
                Ready to Use
              </p>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                Your wallet balance is fully available for tips, rain events, purchases, and withdrawals.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
