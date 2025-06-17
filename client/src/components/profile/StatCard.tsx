import React from 'react';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  icon: React.ReactNode;
  isCurrency?: boolean;
  isRank?: boolean;
}

const StatCard: React.FC<Props> = ({ label, value, icon, isCurrency = false, isRank = false }) => {
  return (
    <div className="bg-zinc-900/70 backdrop-blur-sm p-4 rounded-lg border border-zinc-700/30 transition-all hover:bg-zinc-900/90 hover:border-zinc-700/50 group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-zinc-300 text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-zinc-200 group-hover:text-white transition-colors">
        {isCurrency ? formatCurrency(value) : isRank ? `#${value}` : formatNumber(value)}
      </div>
    </div>
  );
};

export default StatCard; 