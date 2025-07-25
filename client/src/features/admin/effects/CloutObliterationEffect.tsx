import React from 'react';

interface ReputationObliterationEffectProps {
  isActive?: boolean;
  intensity?: number;
}

export const ReputationObliterationEffect: React.FC<ReputationObliterationEffectProps> = ({
  isActive = false,
  intensity = 1
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 bg-red-600/20 animate-pulse" 
           style={{ animationDuration: `${2 / intensity}s` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/10 to-transparent animate-pulse"
           style={{ animationDuration: `${3 / intensity}s` }} />
    </div>
  );
};