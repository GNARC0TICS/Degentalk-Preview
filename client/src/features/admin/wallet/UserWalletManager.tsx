import React, { useState } from 'react';
import UserSearchForm from './components/UserSearchForm';
import { useUserFinancialProfile } from './hooks/useUserFinancialProfile.ts';
import BalanceCard from './components/BalanceCard';
import ManualCreditForm from './components/ManualCreditForm';
import ManualDebitForm from './components/ManualDebitForm';
import type { UserId } from '@shared/types/ids';

const UserWalletManager: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<UserId | null>(null);
  const { data, error, isLoading } = useUserFinancialProfile(selectedUserId);

  const handleSearch = (userId: string) => {
    setSelectedUserId(userId as UserId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Wallet Manager</h1>
      <UserSearchForm onSearch={handleSearch} />

      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}

      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Financial Profile for {data.userId}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <BalanceCard title="DGT Balance" balance={data.dgtBalance.toLocaleString()} />
            <BalanceCard title="Crypto Balance" balance={`$${data.cryptoBalance.toLocaleString()}`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ManualCreditForm />
            <ManualDebitForm />
          </div>

          {/* Transaction history will go here */}
        </div>
      )}
    </div>
  );
};

export default UserWalletManager;