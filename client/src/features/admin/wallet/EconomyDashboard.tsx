import React from 'react';
import { useDgtAnalytics } from './hooks/useDgtAnalytics';
import BalanceCard from './components/BalanceCard';

const EconomyDashboard: React.FC = () => {
  const { data, error, isLoading } = useDgtAnalytics();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Economy Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard title="Total DGT" balance={data.totalDgt.toLocaleString()} />
        <BalanceCard title="Total Crypto" balance={`$${data.totalCrypto.toLocaleString()}`} />
        <BalanceCard title="DGT in Circulation" balance={data.dgtInCirculation.toLocaleString()} />
        <BalanceCard title="DGT in Treasury" balance={data.dgtInTreasury.toLocaleString()} />
      </div>
    </div>
  );
};

export default EconomyDashboard;