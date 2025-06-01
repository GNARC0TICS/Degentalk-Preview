import axios from 'axios';

// Bypassed for now - using mock data
// const TRON_NODE_URL = import.meta.env.VITE_TRON_NODE_URL;
// const USDT_CONTRACT_ADDRESS = import.meta.env.VITE_USDT_CONTRACT;
// const TRONGRID_API_KEY = import.meta.env.VITE_TRONGRID_API_KEY;

// Helper to get headers for TronGrid
// const tronHeaders = {
//   'TRON-PRO-API-KEY': TRONGRID_API_KEY,
// };

export async function getWalletBalance(address: string) {
  // Bypass: Return mock balance
  console.warn('wallet-service: Bypassing API call for getWalletBalance');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return { trx: 123.45, usdt: 987.65 };
  // Fetch TRX and USDT balance for the address
  // const [trxRes, usdtRes] = await Promise.all([
  //   axios.get(`${TRON_NODE_URL}/v1/accounts/${address}`),
  //   axios.get(`${TRON_NODE_URL}/v1/accounts/${address}/tokens?contract_address=${USDT_CONTRACT_ADDRESS}`, { headers: tronHeaders })
  // ]);
  // const trx = trxRes.data.data?.[0]?.balance || 0;
  // const usdt = usdtRes.data.data?.[0]?.balance || 0;
  // return { trx, usdt };
}

export async function getTransactionHistory(address: string) {
  // Bypass: Return empty history or mock history
  console.warn('wallet-service: Bypassing API call for getTransactionHistory');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Return empty array for now, or create mock transactions if needed for UI testing
  return [];
  // Fetch recent transactions for the address
  // const res = await axios.get(`${TRON_NODE_URL}/v1/accounts/${address}/transactions`, { headers: tronHeaders });
  // return res.data.data || [];
}

export async function deposit(address: string, amount: number) {
  // This would normally trigger a deposit flow (e.g., show QR or request transfer)
  // For now, just return the address and amount for UI
  return { address, amount };
}

export async function withdraw(address: string, amount: number) {
  // This would normally call a backend API to sign and send a withdrawal
  // For now, just return the address and amount for UI
  return { address, amount };
} 