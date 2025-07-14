import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

interface TipPostModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (amount: number) => void;
	recipientUsername: string;
	currentBalance?: number;
	minAmount?: number;
	maxAmount?: number;
	currency?: string; // For future token selection
	isTipping?: boolean;
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export const TipPostModal: React.FC<TipPostModalProps> = ({
	isOpen,
	onOpenChange,
	onConfirm,
	recipientUsername,
	currentBalance = 0,
	minAmount = 1,
	maxAmount = 10000,
	currency = 'DGT',
	isTipping = false
}) => {
	const [amount, setAmount] = useState<string>('');
	const [error, setError] = useState<string>('');

	const numericAmount = parseFloat(amount) || 0;
	const isValidAmount =
		numericAmount >= minAmount && numericAmount <= maxAmount && numericAmount <= currentBalance;

	const handleAmountChange = (value: string) => {
		// Allow only numbers and decimal point
		if (value === '' || /^\d*\.?\d*$/.test(value)) {
			setAmount(value);
			setError('');

			const num = parseFloat(value);
			if (num > currentBalance) {
				setError(`Insufficient balance. You have ${currentBalance} ${currency}`);
			} else if (num < minAmount && value !== '') {
				setError(`Minimum tip amount is ${minAmount} ${currency}`);
			} else if (num > maxAmount) {
				setError(`Maximum tip amount is ${maxAmount} ${currency}`);
			}
		}
	};

	const handlePresetClick = (presetAmount: number) => {
		setAmount(presetAmount.toString());
		handleAmountChange(presetAmount.toString());
	};

	const handleConfirm = () => {
		if (isValidAmount) {
			onConfirm(numericAmount);
			// Modal will be closed by parent component after successful tip
		}
	};

	const handleClose = () => {
		setAmount('');
		setError('');
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Coins className="h-5 w-5 text-emerald-500" />
						Tip {recipientUsername}
					</DialogTitle>
					<DialogDescription className="text-zinc-400">
						Send a tip to show your appreciation. Your current balance: {currentBalance} {currency}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Preset amounts */}
					<div className="grid grid-cols-5 gap-2">
						{PRESET_AMOUNTS.map((preset) => (
							<Button
								key={preset}
								variant="outline"
								size="sm"
								onClick={() => handlePresetClick(preset)}
								disabled={preset > currentBalance}
								className={cn(
									'border-zinc-700 hover:bg-zinc-800',
									amount === preset.toString() && 'bg-zinc-800 border-emerald-600',
									preset > currentBalance && 'opacity-50 cursor-not-allowed'
								)}
							>
								{preset}
							</Button>
						))}
					</div>

					{/* Custom amount input */}
					<div className="space-y-2">
						<Label htmlFor="tip-amount">Custom Amount</Label>
						<div className="relative">
							<Input
								id="tip-amount"
								type="text"
								value={amount}
								onChange={(e) => handleAmountChange(e.target.value)}
								placeholder={`Enter amount (${minAmount}-${maxAmount} ${currency})`}
								className={cn('pr-12', error && 'border-red-500 focus:border-red-500')}
							/>
							<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
								{currency}
							</span>
						</div>
						{error && (
							<div className="flex items-center gap-1 text-sm text-red-500">
								<AlertCircle className="h-3 w-3" />
								{error}
							</div>
						)}
					</div>

					{/* Future: Token selection dropdown could go here */}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isTipping}
						className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={!isValidAmount || isTipping}
						className="bg-emerald-600 hover:bg-emerald-700"
					>
						{isTipping ? 'Sending...' : `Send ${numericAmount || 0} ${currency}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
