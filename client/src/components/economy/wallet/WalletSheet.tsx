import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletBalanceDisplay } from './wallet-balance-display';
import TransactionHistory from './transaction-history';
import { TransactionSheet } from './TransactionSheet';
import { useWallet } from '@/hooks/use-wallet';
import { 
  Wallet, ArrowDown, ArrowUp, CreditCard, History, 
  QrCode, Copy, ExternalLink, AlertCircle, Inbox
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// [REFAC-DGT]
interface WalletSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Define interface to match expected balance structure
interface WalletBalanceData {
  walletBalanceUSDT?: number;
  dgtPoints?: number;
  walletPendingWithdrawals?: any[];
}

export function WalletSheet({ isOpen, onOpenChange }: WalletSheetProps) {
  const { 
    balance, 
    isLoadingBalance, 
    transactions,
    isLoadingTransactions,
    createDepositAddress
  } = useWallet();
  
  const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');
  
  // Handle opening the transaction detail sheet
  const handleViewAllTransactions = () => {
    setIsTransactionSheetOpen(true);
  };
  
  // Handle closing the transaction sheet and returning to the main wallet sheet
  const handleTransactionSheetBack = () => {
    setIsTransactionSheetOpen(false);
  };
  
  // Prepare data for wallet display by typecasting to match the expected interface
  const walletDataWithDefaults = {
    walletBalanceUSDT: (balance as any)?.walletBalanceUSDT || 0,
    dgtPoints: (balance as any)?.dgtPoints || 0,
    pendingWithdrawals: (balance as any)?.walletPendingWithdrawals || []
  };
  
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-md bg-zinc-900/95 border-zinc-800 text-white p-0 flex flex-col overflow-hidden">
          <SheetHeader className="p-6 pb-4 border-b border-zinc-800 flex-none bg-gradient-to-r from-zinc-900 to-zinc-900/90">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl text-emerald-400 flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-emerald-500" />
                Wallet
              </SheetTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleViewAllTransactions}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 flex items-center transition-colors"
              >
                <History className="h-4 w-4 mr-1" />
                Transactions
              </Button>
            </div>
            <SheetDescription className="text-zinc-400">
              Manage your DGT balance, deposits, and withdrawals.
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Wallet Balance Display */}
              <WalletBalanceDisplay
                walletBalanceUSDT={walletDataWithDefaults.walletBalanceUSDT}
                dgtPoints={walletDataWithDefaults.dgtPoints}
                pendingWithdrawals={walletDataWithDefaults.pendingWithdrawals}
                className="w-full"
              />
              
              {/* Tabs for Deposit, Withdraw, Buy DGT */}
              <Tabs 
                defaultValue="deposit" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 h-11 bg-zinc-800/50">
                  <TabsTrigger 
                    value="deposit" 
                    className="flex items-center gap-1 data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger 
                    value="withdraw" 
                    className="flex items-center gap-1 data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Withdraw
                  </TabsTrigger>
                  <TabsTrigger 
                    value="buy" 
                    className="flex items-center gap-1 data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400"
                  >
                    <CreditCard className="h-4 w-4" />
                    Buy DGT
                  </TabsTrigger>
                </TabsList>
                
                {/* Deposit Tab Content */}
                <TabsContent value="deposit" className="mt-4">
                  <div className="space-y-4 min-h-0"> {/* Added min-h-0 */}
                    <div className="bg-zinc-800/30 rounded-lg p-4 space-y-3">
                      <h3 className="text-lg font-medium text-white">
                        Deposit Funds
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Currently, direct crypto deposits are being updated. Please check back soon or use alternative methods to fund your DGT balance.
                      </p>
                       {/* Placeholder for future deposit instructions or component - made more compact */}
                      <div className="bg-black/50 rounded-lg p-4 flex flex-col items-center justify-center text-center h-32"> {/* Reduced height to h-32, adjusted padding */}
                        <QrCode className="h-12 w-12 text-zinc-600 mb-2" /> {/* Reduced icon size */}
                        <p className="text-zinc-500 text-sm">Deposit feature coming soon.</p> {/* Simplified text */}
                        <p className="text-xs text-zinc-600 mt-1">Thank you for your patience.</p>
                      </div>
                       <div className="flex items-center text-amber-400 bg-amber-900/20 rounded px-3 py-2 text-sm">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>Please ensure you are on the official DegenTalk platform before making any transactions.</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Withdraw Tab Content */}
                <TabsContent value="withdraw" className="mt-4">
                  <div className="space-y-4 min-h-0"> {/* Added min-h-0 */}
                    <div className="bg-zinc-800/30 rounded-lg p-6"> {/* Kept p-6 for consistency if forms are larger */}
                      <h3 className="text-lg font-medium text-white mb-4">Withdraw Funds</h3>
                      {/* Placeholder for withdrawal form - can be enhanced later */}
                      <p className="text-zinc-400 mb-4">Enter the amount and destination address to withdraw your funds.</p>
                      <Button disabled className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
                        Withdraw
                      </Button>
                      <p className="text-xs text-zinc-500 mt-2 text-center">Withdrawals are processed within 24 hours.</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Buy DGT Tab Content */}
                <TabsContent value="buy" className="mt-4">
                  <div className="space-y-4 min-h-0"> {/* Added min-h-0 */}
                    <div className="bg-zinc-800/30 rounded-lg p-6"> {/* Kept p-6 for consistency */}
                      <h3 className="text-lg font-medium text-white mb-4">Buy DGT</h3>
                      {/* Placeholder for DGT purchase form - can be enhanced later */}
                      <p className="text-zinc-400 mb-4">Purchase DGT tokens to use across the platform.</p>
                      <Button disabled className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
                        Buy DGT
                      </Button>
                      <p className="text-xs text-zinc-500 mt-2 text-center">DGT purchases are credited instantly to your wallet.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Recent Transactions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <History className="h-4 w-4 mr-2 text-emerald-500" />
                    Recent Transactions
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleViewAllTransactions}
                    className="text-emerald-400 hover:text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/20 hover:border-emerald-800/80"
                  >
                    View All
                  </Button>
                </div>
                
                {/* Display a limited number of transactions */}
                <div className="bg-zinc-800/30 rounded-lg overflow-hidden border border-zinc-800/80">
                  {isLoadingTransactions ? (
                    <div className="p-8 text-center text-zinc-500">
                      <div className="inline-block animate-spin mr-2">⟳</div>
                      Loading transactions...
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="divide-y divide-zinc-800/50">
                      {transactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} className="p-3 flex items-center justify-between transition-colors hover:bg-zinc-800/30">
                          <div className="flex items-center overflow-hidden">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0
                              ${tx.type === 'deposit' ? 'bg-green-900/30 text-green-500' : ''}
                              ${tx.type === 'withdrawal' ? 'bg-red-900/30 text-red-500' : ''}
                              ${tx.type === 'purchase' || tx.type === 'tip' ? 'bg-amber-900/30 text-amber-500' : ''}
                            `}>
                              {tx.type === 'deposit' ? (
                                <ArrowDown className="h-5 w-5" />
                              ) : tx.type === 'withdrawal' ? (
                                <ArrowUp className="h-5 w-5" />
                              ) : (
                                <CreditCard className="h-5 w-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{tx.description}</div>
                              <div className="text-xs text-zinc-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className={`
                            text-sm font-medium ml-3 flex-shrink-0
                            ${tx.type === 'deposit' ? 'text-green-400' : ''}
                            ${tx.type === 'withdrawal' ? 'text-red-400' : ''}
                            ${tx.type === 'purchase' || tx.type === 'tip' ? 'text-amber-400' : ''}
                          `}>
                            {tx.type === 'deposit' ? '+' : '-'}
                            ${tx.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                      
                      {transactions.length > 3 && (
                        <button 
                          className="w-full p-3 text-center text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer focus:outline-none hover:bg-emerald-900/10 transition-colors"
                          onClick={handleViewAllTransactions}
                        >
                          View {transactions.length - 3} more transactions
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-500">
                      <Inbox className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                      <p>No recent transactions</p>
                      <p className="text-xs text-zinc-600 mt-1">Your transactions will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      {/* Transaction Sheet - shown when viewing all transactions */}
      <TransactionSheet 
        isOpen={isTransactionSheetOpen} 
        onOpenChange={setIsTransactionSheetOpen} 
        onBack={handleTransactionSheetBack}
      />
    </>
  );
}
