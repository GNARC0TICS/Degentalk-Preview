import type { UserId } from '../../types/ids.js';

export function logDevEvent(action: string, result: any, setLog: (fn: (prev: string[]) => string[]) => void) {
	setLog((prev) => [
		...prev,
		`[${new Date().toLocaleTimeString()}] ${action}: ${JSON.stringify(result)}`
	]);
}

export async function mockDeposit(userId: UserId, amount: number) {
	// Simulate a deposit by calling a dev/test endpoint or directly updating via API
	await fetch('/api/wallet/mock-deposit', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId, amount })
	});
}

export async function forceBalanceSync(userId: UserId) {
	// Simulate a force balance sync (e.g., call backend to poll TronGrid)
	await fetch('/api/wallet/force-balance-sync', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId })
	});
}
