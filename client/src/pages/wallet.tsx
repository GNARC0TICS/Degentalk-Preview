import React from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { WalletBalanceDisplay } from '@/components/economy/wallet/wallet-balance-display';
import TransactionHistory from '@/components/economy/wallet/transaction-history';
import { DepositButton } from '@/components/economy/wallet/deposit-button';
import { WithdrawButton } from '@/components/economy/wallet/withdraw-button';
import { BuyDgtButton } from '@/components/economy/wallet/buy-dgt-button';
import { Link } from 'wouter';

const WalletPage: React.FC = () => {
  const { address, balance, transactionHistory, isLoading, error, refetchBalance, refetchTx } = useWallet();
  const [tab, setTab] = React.useState<'deposit' | 'withdraw' | 'buy-dgt'>('deposit');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-2 py-6 md:px-0">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center text-emerald-400 drop-shadow-glow">My Wallet</h1>
        <div className="rounded-xl border border-emerald-500/50 bg-zinc-900/60 shadow-lg p-6 flex flex-col items-center">
          <WalletBalanceDisplay balance={balance} isLoading={isLoading} error={error} onRefresh={refetchBalance} />
        </div>
        <div className="flex rounded-lg overflow-hidden border border-zinc-700">
          <button
            className={`flex-1 py-2.5 px-2 text-center text-sm font-semibold transition-colors ${tab === 'deposit' ? 'bg-cyan-800/70 text-cyan-200 shadow-inner shadow-cyan-900/50' : 'bg-zinc-900/50 text-zinc-400 hover:bg-cyan-950/50'}`}
            onClick={() => setTab('deposit')}
          >
            Deposit
          </button>
          <button
            className={`flex-1 py-2.5 px-2 text-center text-sm font-semibold transition-colors ${tab === 'withdraw' ? 'bg-purple-800/70 text-purple-200 shadow-inner shadow-purple-900/50' : 'bg-zinc-900/50 text-zinc-400 hover:bg-purple-950/50'}`}
            onClick={() => setTab('withdraw')}
          >
            Withdraw
          </button>
          <button
            className={`flex-1 py-2.5 px-2 text-center text-sm font-semibold transition-colors ${tab === 'buy-dgt' ? 'bg-emerald-800/70 text-emerald-200 shadow-inner shadow-emerald-900/50' : 'bg-zinc-900/50 text-zinc-400 hover:bg-emerald-950/50'}`}
            onClick={() => setTab('buy-dgt')}
          >
            Buy DGT
          </button>
        </div>
        <div>
          {tab === 'deposit' && (
            <div className="rounded-lg border border-cyan-600/50 bg-cyan-950/30 p-6">
              <DepositButton address={address} onSuccess={refetchBalance} />
            </div>
          )}
          {tab === 'withdraw' && (
            <div className="rounded-lg border border-purple-600/50 bg-purple-950/30 p-6">
              <WithdrawButton address={address} onSuccess={refetchBalance} />
            </div>
          )}
          {tab === 'buy-dgt' && (
            <div className="rounded-lg border border-emerald-600/50 bg-emerald-950/30 p-6">
              <BuyDgtButton />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/70 shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-emerald-300">Recent Transactions</h2>
          <TransactionHistory history={transactionHistory} isLoading={isLoading} error={error} onRefresh={refetchTx} />
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 