import React from 'react';
import WalletSummaryWidget from '@/components/sidebar/wallet-summary-widget';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';

/**
 * Widget wrapper for WalletSummaryWidget that provides authentication and wallet data
 */
export default function WalletSummaryWidgetWrapper() {
  const { isAuthenticated } = useAuth();
  const { data: walletData } = useWallet();

  return (
    <WalletSummaryWidget 
      isLoggedIn={isAuthenticated}
      walletData={walletData}
    />
  );
}