import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // We'll create a simple App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, setupXpGainListener, setupLevelUpListener } from '@/lib/queryClient'; // Assuming @/lib resolves correctly via tsconfig paths
// import { WalletProvider } from '@/contexts/wallet-context'; // Placeholder - WalletProvider might need to be adapted or mocked initially

// Placeholder for toast function - replace with actual toast implementation if needed for XP/Level Up
const showXpToast = (data: any) => {
  console.log('XP GAINED (Toast Placeholder):', data);
  alert(`XP Gained! Action: ${data.action}, Amount: ${data.amount}, Desc: ${data.description}`);
};

const showLevelUpModal = (level: number, title?: string, rewards?: any[]) => {
  console.log('LEVEL UP (Modal Placeholder):', { level, title, rewards });
  alert(`Level Up! New Level: ${level}, Title: ${title || 'N/A'}`);
};

// Setup XP and Level Up listeners
setupXpGainListener(showXpToast);
setupLevelUpListener(showLevelUpModal);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <WalletProvider> */}
        <App />
      {/* </WalletProvider> */}
    </QueryClientProvider>
  </React.StrictMode>
);
