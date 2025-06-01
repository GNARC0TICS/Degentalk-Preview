import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

/**
 * WalletBalance Component
 * 
 * Displays the user's DGT balance and crypto balances (USDT, TRX)
 * Uses the new wallet hook to fetch balances
 * 
 * // [REFAC-DGT] [REFAC-CCPAYMENT]
 */
export default function WalletBalance() {
  const { balance, isLoadingBalance, balanceError, refreshBalance } = useWallet();
  
  const handleRefresh = () => {
    refreshBalance();
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Wallet Balance</CardTitle>
        <button 
          onClick={handleRefresh}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
          title="Refresh balance"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span className="sr-only">Refresh</span>
        </button>
      </CardHeader>
      <CardContent>
        {isLoadingBalance ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-32" />
          </div>
        ) : balanceError ? (
          <div className="text-sm text-destructive">
            Error loading balance. Please try again.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {formatCurrency(balance?.dgt || 0, 'DGT')}
              </span>
            </div>
            
            {/* Crypto balances (CCPayment) */}
            {balance?.crypto && Object.entries(balance.crypto).length > 0 ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                <h4 className="text-xs text-muted-foreground mb-1">Crypto Balances:</h4>
                {Object.entries(balance.crypto).map(([currency, amount]) => (
                  <div key={currency} className="flex justify-between">
                    <span>{currency}</span>
                    <span>{formatCurrency(amount as number, currency)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No crypto balance available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 