import React, { useState } from 'react';
import { Send, User, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { type UserId } from "@shared/types";

interface DgtTransferProps {
	className?: string;
}

/**
 * DGT Transfer Component
 *
 * Allows users to send DGT tokens to other users with optional notes
 */
export function DgtTransfer({ className = '' }: DgtTransferProps) {
	const [recipientUsername, setRecipientUsername] = useState('');
	const [transferAmount, setTransferAmount] = useState('');
	const [transferNote, setTransferNote] = useState('');
	const [isValidatingUser, setIsValidatingUser] = useState(false);
	const [validatedUser, setValidatedUser] = useState<{ id: string; username: string } | null>(null);

	const { toast } = useToast();
	const { balance, walletConfig, transferDgt, isTransferringDgt } = useWallet();

	// Get DGT balance and feature gates
	const dgtBalance = balance?.dgt?.balance || 0;
	const canTransfer = walletConfig?.features?.allowInternalTransfers ?? false;
	const maxTransfer = walletConfig?.limits?.maxDGTTransfer || 10000;

	const validateUser = async () => {
		if (!recipientUsername.trim()) {
			toast({
				title: 'Username Required',
				description: 'Please enter a username to transfer DGT to',
				variant: 'destructive'
			});
			return;
		}

		setIsValidatingUser(true);
		try {
			// This would be a real API call to validate the user
			// For now, simulate validation
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock validation - in real app, call /api/users/search
			const mockUser = {
				id: `user_${recipientUsername.toLowerCase()}`,
				username: recipientUsername
			};

			setValidatedUser(mockUser);
			toast({
				title: 'User Found',
				description: `User @${recipientUsername} is ready to receive DGT`,
				variant: 'default'
			});
		} catch (error) {
			toast({
				title: 'User Not Found',
				description: 'Could not find a user with that username',
				variant: 'destructive'
			});
			setValidatedUser(null);
		} finally {
			setIsValidatingUser(false);
		}
	};

	const handleTransfer = async () => {
		if (!canTransfer) {
			toast({
				title: 'Feature Disabled',
				description: 'DGT transfers are currently disabled',
				variant: 'destructive'
			});
			return;
		}

		if (!validatedUser) {
			toast({
				title: 'User Not Validated',
				description: 'Please validate the recipient username first',
				variant: 'destructive'
			});
			return;
		}

		const amount = parseFloat(transferAmount);
		if (isNaN(amount) || amount <= 0) {
			toast({
				title: 'Invalid Amount',
				description: 'Please enter a valid transfer amount',
				variant: 'destructive'
			});
			return;
		}

		if (amount > dgtBalance) {
			toast({
				title: 'Insufficient Balance',
				description: 'Your DGT balance is too low for this transfer',
				variant: 'destructive'
			});
			return;
		}

		if (amount > maxTransfer) {
			toast({
				title: 'Amount Too High',
				description: `Maximum transfer amount is ${maxTransfer.toLocaleString()} DGT`,
				variant: 'destructive'
			});
			return;
		}

		// Minimum transfer of 1 DGT
		if (amount < 1) {
			toast({
				title: 'Amount Too Low',
				description: 'Minimum transfer amount is 1 DGT',
				variant: 'destructive'
			});
			return;
		}

		try {
			await transferDgt({
				toUserId: validatedUser.id,
				amount,
				note: transferNote.trim() || undefined
			});

			// Reset form on success
			setRecipientUsername('');
			setTransferAmount('');
			setTransferNote('');
			setValidatedUser(null);
		} catch (error) {
			// Error handling is done in the useWallet hook
		}
	};

	const setMaxAmount = () => {
		const maxAllowed = Math.min(dgtBalance, maxTransfer);
		setTransferAmount(maxAllowed.toString());
	};

	return (
		<Card className={`w-full ${className}`}>
			<CardHeader>
				<CardTitle className="text-lg font-medium text-white flex items-center">
					<div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
						<Send className="h-4 w-4 text-white" />
					</div>
					Send DGT
				</CardTitle>
				<p className="text-sm text-zinc-400">
					{!canTransfer ? (
						<span className="text-red-400 flex items-center">
							<Lock className="h-4 w-4 mr-1" />
							DGT transfers are currently disabled
						</span>
					) : (
						'Send DGT tokens to other Degentalk users'
					)}
				</p>
			</CardHeader>

			<CardContent className="space-y-4">
				{canTransfer ? (
					<>
						{/* Balance Display */}
						<div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
							<div className="flex items-center justify-between">
								<span className="text-sm text-zinc-400">Available Balance</span>
								<div className="flex items-center space-x-2">
									<Badge
										variant="outline"
										className="text-emerald-400 border-emerald-600/30 bg-emerald-900/20"
									>
										{dgtBalance.toFixed(2)} DGT
									</Badge>
									<span className="text-xs text-zinc-500">
										Max: {maxTransfer.toLocaleString()} DGT
									</span>
								</div>
							</div>
						</div>

						{/* Recipient */}
						<div>
							<h4 className="text-sm text-zinc-400 mb-2">Recipient Username</h4>
							<div className="flex items-center space-x-2">
								<div className="relative flex-1">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
									<Input
										placeholder="Enter username (without @)"
										value={recipientUsername}
										onChange={(e) => {
											setRecipientUsername(e.target.value);
											setValidatedUser(null); // Clear validation when changing
										}}
										variant="wallet"
										className="pl-10 focus:border-purple-800/70"
										disabled={!canTransfer}
									/>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={validateUser}
									disabled={!canTransfer || !recipientUsername.trim() || isValidatingUser}
									className="whitespace-nowrap"
								>
									{isValidatingUser ? 'Checking...' : 'Validate'}
								</Button>
							</div>
							{validatedUser && (
								<p className="text-xs text-emerald-500 mt-1 flex items-center">
									<CheckCircle2 className="h-3 w-3 mr-1" />
									User @{validatedUser.username} validated
								</p>
							)}
						</div>

						{/* Amount */}
						<div>
							<h4 className="text-sm text-zinc-400 mb-2">Transfer Amount (DGT)</h4>
							<div className="flex items-center space-x-2">
								<Input
									type="number"
									placeholder="0.00"
									value={transferAmount}
									onChange={(e) => setTransferAmount(e.target.value)}
									variant="wallet"
									min={1}
									max={Math.min(dgtBalance, maxTransfer)}
									className="flex-1 focus:border-purple-800/70"
									disabled={!canTransfer}
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={setMaxAmount}
									className="whitespace-nowrap"
									disabled={!canTransfer || dgtBalance <= 0}
								>
									Max
								</Button>
							</div>
							<p className="text-xs text-zinc-500 mt-1">
								Min: 1 DGT • Max: {Math.min(dgtBalance, maxTransfer).toLocaleString()} DGT
							</p>
						</div>

						{/* Optional Note */}
						<div>
							<h4 className="text-sm text-zinc-400 mb-2">Note (Optional)</h4>
							<Textarea
								placeholder="Add a message with your transfer..."
								value={transferNote}
								onChange={(e) => setTransferNote(e.target.value)}
								variant="wallet"
								className="focus:border-purple-800/70 resize-none"
								rows={3}
								maxLength={200}
								disabled={!canTransfer}
							/>
							<p className="text-xs text-zinc-500 mt-1">{transferNote.length}/200 characters</p>
						</div>

						{/* Transfer Button */}
						<div className="flex justify-end pt-2">
							<Button
								variant="gradient"
								leftIcon={<Send className="h-4 w-4" />}
								onClick={handleTransfer}
								isLoading={isTransferringDgt}
								disabled={
									!canTransfer ||
									!validatedUser ||
									!transferAmount ||
									isNaN(parseFloat(transferAmount)) ||
									parseFloat(transferAmount) <= 0 ||
									parseFloat(transferAmount) > dgtBalance ||
									parseFloat(transferAmount) > maxTransfer ||
									parseFloat(transferAmount) < 1 ||
									isTransferringDgt
								}
								className="transition-all hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] active:scale-95"
							>
								{isTransferringDgt ? 'Sending...' : 'Send DGT'}
							</Button>
						</div>

						{/* Information */}
						<div className="bg-black/50 rounded-lg p-3 text-xs border border-zinc-800">
							<h4 className="text-zinc-400 font-medium mb-2">Transfer Information</h4>
							<ul className="list-disc pl-5 space-y-1 text-zinc-500">
								<li>DGT transfers are instant and irreversible.</li>
								<li>Minimum transfer amount is 1 DGT.</li>
								<li>
									Maximum transfer amount is {maxTransfer.toLocaleString()} DGT per transaction.
								</li>
								<li>Both users will see the transfer in their transaction history.</li>
								<li>Notes are private and only visible to the recipient.</li>
							</ul>
						</div>
					</>
				) : (
					<div className="text-center py-8">
						<Lock className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
						<p className="text-zinc-400 mb-2">DGT Transfers Disabled</p>
						<p className="text-zinc-500 text-sm">
							DGT transfers are currently disabled by the administrator.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
