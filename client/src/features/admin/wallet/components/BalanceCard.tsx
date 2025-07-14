import React from 'react';

interface BalanceCardProps {
  title: string;
  balance: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ title, balance }) => {
  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl">{balance}</p>
    </div>
  );
};

export default BalanceCard;
