import React from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WalletAddressDisplayProps {
  walletAddress: string;
  copiedAddress?: boolean;
  onCopy?: () => void;
  className?: string;
}

export function WalletAddressDisplay({
  walletAddress,
  copiedAddress = false,
  onCopy,
  className
}: WalletAddressDisplayProps) {
  if (!walletAddress) {
    return (
      <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 ${className}`}>
        <h3 className="text-sm text-zinc-400 mb-2">Wallet Address</h3>
        <div className="bg-zinc-900/50 rounded-lg p-3 text-zinc-500 italic text-sm">
          No wallet address connected yet. Deposit USDT to generate an address.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 ${className}`}>
      <h3 className="text-sm text-zinc-400 mb-2">Your Wallet Address (TRC-20)</h3>
      <div className="flex items-center space-x-2">
        <div className="bg-black rounded-lg border border-zinc-800 py-2 px-3 font-mono text-sm text-zinc-300 flex-1 truncate transition-all hover:border-zinc-700">
          {walletAddress}
        </div>
        
        <Button 
          variant="outline" 
          size="icon-sm"
          onClick={onCopy}
          className={`transition-all ${copiedAddress ? 'border-emerald-700 bg-emerald-950/30' : ''}`}
        >
          {copiedAddress ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-zinc-500 mt-1">
        Only send USDT (TRC-20) to this address. Other tokens may be lost.
      </p>
    </div>
  );
}