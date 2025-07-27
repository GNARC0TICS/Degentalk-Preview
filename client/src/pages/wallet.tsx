import React from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { WalletBalanceDisplay } from '@/features/wallet/components/wallet-balance-display';
import TransactionHistory from '@/features/wallet/components/transaction-history';
import { DepositButton } from '@/features/wallet/components/deposit-button';
import { WithdrawButton } from '@/features/wallet/components/withdraw-button';
import { BuyDgtButton } from '@/features/wallet/components/buy-dgt-button';
import { DgtTransfer } from '@/features/wallet/components/dgt-transfer';
import { Link } from 'react-router-dom';

const WalletPage: React.FC = () => {
	const {
		balance,
		transactions,
		isLoadingBalance,
		isLoadingTransactions,
		balanceError,
		transactionsError,
		refreshBalance,
		refreshTransactions
	} = useWallet();

	// Count pending transactions
	const pendingTransactions = transactions.filter(
		(tx) => tx.status.toLowerCase() === 'pending' || tx.status.toLowerCase() === 'processing'
	).length;
	const [tab, setTab] = React.useState<'deposit' | 'withdraw' | 'buy-dgt' | 'transfer'>('deposit');

	return (
		<div className="min-h-screen bg-black text-white flex flex-col items-center px-2 py-6 md:px-0">
			<div className="w-full max-w-md space-y-6">
				<h1 className="text-3xl font-bold text-center text-emerald-400 drop-shadow-glow fade-in-up">
					My Wallet
				</h1>
				<div
					className="rounded-xl border border-emerald-500/50 bg-zinc-900/60 shadow-lg p-6 flex flex-col items-center fade-in-up"
					style={{ animationDelay: '0.1s' }}
				>
					<WalletBalanceDisplay
						balance={balance}
						isLoading={isLoadingBalance}
						error={balanceError}
						onRefresh={refreshBalance}
						pendingTransactions={pendingTransactions}
					/>
				</div>
				<div className="grid grid-cols-2 gap-2 mb-4 fade-in-up" style={{ animationDelay: '0.2s' }}>
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
					</div>
					<div className="flex rounded-lg overflow-hidden border border-zinc-700">
						<button
							className={`flex-1 py-2.5 px-2 text-center text-sm font-semibold transition-colors ${tab === 'buy-dgt' ? 'bg-emerald-800/70 text-emerald-200 shadow-inner shadow-emerald-900/50' : 'bg-zinc-900/50 text-zinc-400 hover:bg-emerald-950/50'}`}
							onClick={() => setTab('buy-dgt')}
						>
							Buy DGT
						</button>
						<button
							className={`flex-1 py-2.5 px-2 text-center text-sm font-semibold transition-colors ${tab === 'transfer' ? 'bg-pink-800/70 text-pink-200 shadow-inner shadow-pink-900/50' : 'bg-zinc-900/50 text-zinc-400 hover:bg-pink-950/50'}`}
							onClick={() => setTab('transfer')}
						>
							Transfer
						</button>
					</div>
				</div>
				<div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
					{tab === 'deposit' && (
						<div className="rounded-lg border border-cyan-600/50 bg-cyan-950/30 p-6">
							<DepositButton />
						</div>
					)}
					{tab === 'withdraw' && (
						<div className="rounded-lg border border-purple-600/50 bg-purple-950/30 p-6">
							<WithdrawButton />
						</div>
					)}
					{tab === 'buy-dgt' && (
						<div className="rounded-lg border border-emerald-600/50 bg-emerald-950/30 p-6">
							<BuyDgtButton />
						</div>
					)}
					{tab === 'transfer' && (
						<div className="rounded-lg border border-pink-600/50 bg-pink-950/30 p-6">
							<DgtTransfer />
						</div>
					)}
				</div>
				<div
					className="rounded-xl border border-zinc-700/80 bg-zinc-900/70 shadow p-6 fade-in-up"
					style={{ animationDelay: '0.4s' }}
				>
					<h2 className="text-lg font-semibold mb-4 text-emerald-300">Recent Transactions</h2>
					<TransactionHistory
						history={transactions}
						isLoading={isLoadingTransactions}
						error={transactionsError}
						onRefresh={refreshTransactions}
					/>
				</div>
			</div>
		</div>
	);
};

export default WalletPage;
