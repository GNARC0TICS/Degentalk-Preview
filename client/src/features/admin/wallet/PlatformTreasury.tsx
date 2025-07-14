import React from 'react';
import { useDgtAnalytics } from './hooks/useDgtAnalytics';
import BalanceCard from './components/BalanceCard';

const PlatformTreasury: React.FC = () => {
  const { data, error, isLoading } = useDgtAnalytics();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Platform Treasury</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BalanceCard title="DGT in Treasury" balance={data.dgtInTreasury.toLocaleString()} />
        <BalanceCard title="Total Crypto" balance={`$${data.totalCrypto.toLocaleString()}`} />
      </div>
    </div>
  );
};

export default PlatformTreasury;