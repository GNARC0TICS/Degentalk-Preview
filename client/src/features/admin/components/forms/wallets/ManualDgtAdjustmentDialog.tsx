import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@app/components/ui/select';
import { useToast } from '@app/hooks/use-toast';
import type { UserId } from '@shared/types/ids';

interface ManualDgtAdjustmentDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		userId: string;
		amount: number;
		reason: string;
		type: 'grant' | 'deduct';
	}) => Promise<void>; // Make onSubmit async
	isSubmitting: boolean;
	initialUserId?: string;
	initialTransactionType?: 'grant' | 'deduct';
}

const ManualDgtAdjustmentDialog: React.FC<ManualDgtAdjustmentDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isSubmitting,
	initialUserId = '',
	initialTransactionType = 'grant'
}) => {
	const { toast } = useToast();
	const [userId, setUserId] = useState(initialUserId);
	const [dgtAmount, setDgtAmount] = useState('');
	const [reason, setReason] = useState('');
	const [transactionType, setTransactionType] = useState<'grant' | 'deduct'>(
		initialTransactionType
	);

	useEffect(() => {
		if (isOpen) {
			setUserId(initialUserId);
			setTransactionType(initialTransactionType);
			// Optionally reset other fields or not, depending on desired UX
			// setDgtAmount('');
			// setReason('');
		}
	}, [isOpen, initialUserId, initialTransactionType]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userId.trim() || !dgtAmount) {
			toast({
				variant: 'destructive',
				title: 'Missing Information',
				description: 'Please enter both a User ID and an amount.'
			});
			return;
		}

		const parsedAmount = parseFloat(dgtAmount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			toast({
				variant: 'destructive',
				title: 'Invalid Amount',
				description: 'Amount must be a valid positive number.'
			});
			return;
		}

		try {
			await onSubmit({
				userId: userId.trim(),
				amount: parsedAmount,
				reason: reason.trim() || `Admin ${transactionType}`,
				type: transactionType
			});
			// onClose will typically be called by the parent component on successful submission
		} catch (error) {
			// Error toast is usually handled by the mutation's onError in the parent component
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Adjust User DGT Balance</DialogTitle>
					<DialogDescription>Manually grant or deduct DGT from a user account.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="transactionType" className="text-right">
								Type
							</Label>
							<Select
								value={transactionType}
								onValueChange={(value) => setTransactionType(value as 'grant' | 'deduct')}
							>
								<SelectTrigger id="transactionType" className="col-span-3">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="grant">Grant DGT</SelectItem>
									<SelectItem value="deduct">Deduct DGT</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="userId" className="text-right">
								User ID
							</Label>
							<Input
								id="userId"
								type="text"
								value={userId}
								onChange={(e) => setUserId(e.target.value)}
								className="col-span-3"
								placeholder="Enter User ID (UUID)"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="dgtAmount" className="text-right">
								Amount (DGT)
							</Label>
							<Input
								id="dgtAmount"
								type="number"
								value={dgtAmount}
								onChange={(e) => setDgtAmount(e.target.value)}
								className="col-span-3"
								min="0.01" // Assuming DGT can have decimals
								step="0.01"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="reason" className="text-right">
								Reason
							</Label>
							<Input
								id="reason"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								className="col-span-3"
								placeholder="Optional reason"
							/>
						</div>
					</div>
					<DialogFooter className="flex-wrap gap-2 sm:justify-end">
						<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Processing...' : 'Submit Adjustment'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ManualDgtAdjustmentDialog;
