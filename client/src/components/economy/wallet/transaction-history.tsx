import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/wallet";

/**
 * TransactionHistory Component
 * 
 * Displays a list of wallet transactions with filtering options
 * Uses the new wallet hook to fetch transaction history
 * 
 * // [REFAC-DGT] [REFAC-CCPAYMENT]
 */
export default function TransactionHistory() {
  const { transactions, transactionCount, isLoadingTransactions, refreshTransactions } = useWallet();
  const [filter, setFilter] = useState<string | null>(null);
  
  const filteredTransactions = filter 
    ? transactions.filter(tx => tx.type === filter)
    : transactions;
  
  const handleRefresh = () => {
    refreshTransactions();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <IconDeposit />;
      case 'withdrawal':
        return <IconWithdrawal />;
      case 'purchase':
        return <IconPurchase />;
      case 'transfer':
        return <IconTransfer />;
      case 'tip':
        return <IconTip />;
      case 'rain':
        return <IconRain />;
      case 'airdrop':
        return <IconAirdrop />;
      default:
        return <IconDefault />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-amber-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Transaction History</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={!filter ? "bg-accent" : ""}
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={filter === 'deposit' ? "bg-accent" : ""}
              onClick={() => setFilter('deposit')}
            >
              Deposits
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={filter === 'withdrawal' ? "bg-accent" : ""}
              onClick={() => setFilter('withdrawal')}
            >
              Withdrawals
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={filter === 'tip' || filter === 'rain' ? "bg-accent" : ""}
              onClick={() => setFilter(filter === 'tip' ? 'rain' : 'tip')}
            >
              {filter === 'tip' ? 'Rain' : 'Tips'}
            </Button>
          </div>
          <button 
            onClick={handleRefresh}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
            title="Refresh transactions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="sr-only">Refresh</span>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingTransactions ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start space-x-4 rounded-md border p-3">
                  <div className="mt-px">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(transaction.status)}`} />
                        <Badge variant="outline">{transaction.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        {transaction.to && (
                          <p className="text-xs text-muted-foreground">
                            To: {transaction.to.username}
                          </p>
                        )}
                        {transaction.from && (
                          <p className="text-xs text-muted-foreground">
                            From: {transaction.from.username}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {transaction.type === 'withdrawal' || transaction.type === 'transfer' || transaction.type === 'tip' || transaction.type === 'rain' 
                            ? '-' 
                            : '+'}{formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(new Date(transaction.timestamp))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Icons
function IconDeposit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <path d="M12 2L12 22M12 22L2 12M12 22L22 12" />
    </svg>
  );
}

function IconWithdrawal() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
      <path d="M12 22L12 2M12 2L2 12M12 2L22 12" />
    </svg>
  );
}

function IconPurchase() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M6 2L10 6M14 18L18 22M9 6h11l-4 10H4L9 6z" />
    </svg>
  );
}

function IconTransfer() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
      <path d="M22 5H2M2 10H10M2 15H8M22 19H2" />
      <path d="M18 14l4-4-4-4" />
    </svg>
  );
}

function IconTip() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <path d="M8 10V8c0-2.21 1.79-4 4-4v0c2.21 0 4 1.79 4 4v2M8 10h8M8 10v7a1 1 0 001 1h6a1 1 0 001-1v-7M15 2v3M9 2v3M9 18v3M15 18v3" />
    </svg>
  );
}

function IconRain() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1" />
    </svg>
  );
}

function IconAirdrop() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconDefault() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}