import React from 'react';
import { ShoppingBag, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';

interface ShopHeaderProps {
  activeCategory: string;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ activeCategory }) => {
  const { balance, isLoading } = useWallet();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <ShoppingBag className="text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Shop</h2>
        <span className="ml-2 px-2 py-1 rounded bg-cyan-900 text-cyan-300 text-xs font-semibold uppercase">
          {activeCategory}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Wallet className="text-emerald-400" />
          {isLoading ? (
            <span className="text-gray-400 animate-pulse">Loading...</span>
          ) : (
            <span className="text-emerald-300 font-mono text-sm">
              {balance?.dgtPoints ?? 0} DGT / {balance?.usdt ?? 0} USDT
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-300 hover:bg-cyan-900" asChild>
          <a href="/wallet">Wallet</a>
        </Button>
      </div>
    </div>
  );
};

export default ShopHeader;