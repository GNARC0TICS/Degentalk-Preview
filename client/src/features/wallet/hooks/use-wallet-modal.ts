import { create } from 'zustand';

type WalletAction = 'send' | 'tip' | 'buy' | 'stake' | null;

interface TipData {
	recipient: string;
	recipientId: number;
	amount?: number;
}

interface BuyData {
	productId: number;
	productName: string;
	price: number;
	imageUrl?: string;
}

interface StakeData {
	threadId: number;
	threadTitle: string;
	amount?: number;
}

type ActionData = TipData | BuyData | StakeData | null;

interface WalletModalState {
	isOpen: boolean;
	action: WalletAction;
	actionData: ActionData;
	openWalletModal: (action: WalletAction, data?: ActionData) => void;
	closeWalletModal: () => void;
}

/**
 * @hook useWalletModal
 * Zustand store hook for managing the wallet modal's state (open/closed)
 * and the specific action/data associated with opening it (e.g., tip, buy).
 */
export const useWalletModal = create<WalletModalState>((set) => ({
	isOpen: false,
	action: null,
	actionData: null,
	openWalletModal: (action, data = null) => {
		set({
			isOpen: true,
			action,
			actionData: data
		});
	},
	closeWalletModal: () => {
		set({
			isOpen: false,
			action: null,
			actionData: null
		});
	}
}));
