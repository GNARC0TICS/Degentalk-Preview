import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Copy, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';

export interface DepositButtonProps {
	variant?: 'default' | 'small';
	className?: string;
	onClick?: () => void;
}

export function DepositButton({ variant = 'default', className, onClick }: DepositButtonProps) {
	const [selectedCrypto, setSelectedCrypto] = useState<string>('');
	const [copiedAddress, setCopiedAddress] = useState(false);
	const [depositAmount, setDepositAmount] = useState('');
	const [depositMemo, setDepositMemo] = useState('');
	const [showGlow, setShowGlow] = useState(false);
	const { toast } = useToast();
	const {
		depositAddresses,
		isLoadingDepositAddresses,
		refreshDepositAddresses,
		isRefreshingAddresses,
		walletConfig
	} = useWallet();

	// Feature gates
	const canDeposit = depositAddresses.length > 0 && walletConfig?.features;

	// Get the selected deposit address
	const selectedAddress = depositAddresses.find(
		(addr) => selectedCrypto === `${addr.coinSymbol}_${addr.chain}`
	);

	// Set default crypto selection when addresses load
	useEffect(() => {
		if (depositAddresses.length > 0 && !selectedCrypto) {
			// Default to ETH if available, otherwise first option
			const ethAddress = depositAddresses.find((addr) => addr.coinSymbol === 'ETH');
			const defaultAddress = ethAddress || depositAddresses[0];
			setSelectedCrypto(`${defaultAddress.coinSymbol}_${defaultAddress.chain}`);
		}
	}, [depositAddresses, selectedCrypto]);

	const copyToClipboard = () => {
		if (selectedAddress?.address) {
			navigator.clipboard
				.writeText(selectedAddress.address)
				.then(() => {
					setCopiedAddress(true);
					setTimeout(() => setCopiedAddress(false), 3000);

					toast({
						title: 'Address Copied',
						description: 'Deposit address copied to clipboard',
						variant: 'default'
					});
				})
				.catch(() => {
					toast({
						title: 'Failed to Copy',
						description: 'Could not copy address to clipboard',
						variant: 'destructive'
					});
				});
		}
	};

	const handleSubmitTracking = () => {
		const amount = parseFloat(depositAmount);
		if (isNaN(amount) || amount <= 0) {
			toast({
				title: 'Invalid Amount',
				description: 'Please enter a valid deposit amount',
				variant: 'destructive'
			});
			return;
		}

		// Show tracking confirmation
		toast({
			title: 'Deposit Tracking Started',
			description: `We'll monitor for your ${selectedAddress?.coinSymbol} deposit. You'll be notified when it's received and converted to DGT.`,
			variant: 'default'
		});

		// Reset the form
		setDepositAmount('');
		setDepositMemo('');
	};

	// Small variant for compact displays
	if (variant === 'small') {
		const isDisabled = isLoadingDepositAddresses || !canDeposit;
		return (
			<Button
				variant="wallet"
				size="sm"
				leftIcon={
					isDisabled ? <Lock className="h-4 w-4" /> : <ArrowDownToLine className="h-4 w-4" />
				}
				className={className}
				onClick={onClick}
				disabled={isDisabled}
				title={!canDeposit ? 'Deposits are currently unavailable' : undefined}
			>
				{isDisabled ? 'Unavailable' : 'Deposit Crypto'}
			</Button>
		);
	}

	return (
		<div
			className={`bg-black/30 rounded-lg p-4 border border-zinc-800 shadow-lg space-y-4 ${className} ${showGlow ? 'deposit-glow' : ''}`}
		>
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium text-white mb-2">Deposit Crypto</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={() => refreshDepositAddresses()}
					disabled={isRefreshingAddresses || !canDeposit}
					className="flex items-center gap-2"
				>
					<RefreshCw className={`h-4 w-4 ${isRefreshingAddresses ? 'animate-spin' : ''}`} />
					Refresh
				</Button>
			</div>

			<p className="text-zinc-400 text-sm mb-4">
				{!canDeposit ? (
					<span className="text-red-400 flex items-center">
						<Lock className="h-4 w-4 mr-1" />
						Crypto deposits are currently unavailable
					</span>
				) : (
					`Deposit cryptocurrency to your DegenTalk wallet. All deposits are automatically converted to DGT at $${walletConfig?.dgt?.usdPrice || 0.1} per token.`
				)}
			</p>

			{/* Crypto Selection */}
			<div>
				<h4 className="text-sm text-zinc-400 mb-2">Select Cryptocurrency</h4>
				{isLoadingDepositAddresses ? (
					<div className="flex items-center justify-center py-8">
						<RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
						<span className="ml-2 text-zinc-400">Loading deposit addresses...</span>
					</div>
				) : depositAddresses.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-zinc-400 mb-4">No deposit addresses available</p>
						<Button
							variant="outline"
							onClick={() => refreshDepositAddresses()}
							disabled={isRefreshingAddresses}
						>
							Retry Loading
						</Button>
					</div>
				) : (
					<Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Choose cryptocurrency" />
						</SelectTrigger>
						<SelectContent>
							{depositAddresses.map((addr) => (
								<SelectItem
									key={`${addr.coinSymbol}_${addr.chain}`}
									value={`${addr.coinSymbol}_${addr.chain}`}
								>
									{addr.coinSymbol} ({addr.chain})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>

			{/* Deposit Address Display */}
			{selectedAddress && (
				<div>
					<h4 className="text-sm text-zinc-400 mb-2">
						Your Deposit Address ({selectedAddress.coinSymbol} - {selectedAddress.chain})
					</h4>
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<div className="bg-black rounded-lg border border-zinc-800 py-2 px-3 font-mono text-sm text-zinc-300 flex-1 truncate">
								{selectedAddress.address}
							</div>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={copyToClipboard}
								className={copiedAddress ? 'border-emerald-700 bg-emerald-950/30' : ''}
							>
								{copiedAddress ? (
									<CheckCircle2 className="h-4 w-4 text-emerald-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
						{selectedAddress.memo && (
							<div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-800/50 rounded">
								<p className="text-xs text-yellow-300">
									<strong>Memo Required:</strong> {selectedAddress.memo}
								</p>
							</div>
						)}
						<p className="text-xs text-zinc-500">
							Only send {selectedAddress.coinSymbol} on the {selectedAddress.chain} network to this
							address. Other tokens may be lost.
						</p>

						<div className="mt-6">
							<h4 className="text-sm text-zinc-400 mb-2">Expected Deposit Amount (Optional)</h4>
							<Input
								type="number"
								placeholder="0.00"
								value={depositAmount}
								onChange={(e) => setDepositAmount(e.target.value)}
								variant="wallet"
								min={0}
								className="transition-all focus:border-emerald-800/70"
							/>
							<p className="text-xs text-zinc-500 mt-1">
								Minimum deposit: ${walletConfig?.dgt?.minDepositUSD || 1.0} USD value
							</p>
						</div>

						<div className="mt-4">
							<h4 className="text-sm text-zinc-400 mb-2">Memo / Notes (Optional)</h4>
							<Input
								placeholder="Deposit notes or reference"
								value={depositMemo}
								onChange={(e) => setDepositMemo(e.target.value)}
								variant="wallet"
								className="transition-all focus:border-emerald-800/70"
							/>
							<p className="text-xs text-zinc-500 mt-1">
								For your reference only. Not sent with the transaction.
							</p>
						</div>

						<div className="flex justify-end pt-4">
							<Button
								variant="gradient"
								onClick={handleSubmitTracking}
								disabled={
									!depositAmount ||
									isNaN(parseFloat(depositAmount)) ||
									parseFloat(depositAmount) <= 0
								}
								className="transition-all hover:shadow-[0_0_10px_rgba(5,150,105,0.5)] active:scale-95"
							>
								Track Deposit
							</Button>
						</div>
					</div>
				</div>
			)}

			<div className="bg-black/50 rounded-lg p-4 text-xs border border-zinc-800 mt-4">
				<h4 className="text-zinc-400 font-medium mb-2">Deposit Information</h4>
				<ul className="list-disc pl-5 space-y-1 text-zinc-500">
					<li>Deposits are typically credited within 5-30 minutes after network confirmation.</li>
					<li>
						All deposits are automatically converted to DGT at ${walletConfig?.dgt?.usdPrice || 0.1}{' '}
						per token.
					</li>
					<li>Minimum deposit amount is ${walletConfig?.dgt?.minDepositUSD || 1.0} USD value.</li>
					<li>Only send the selected cryptocurrency on the correct network.</li>
					<li>Deposits to wrong networks or addresses may be permanently lost.</li>
				</ul>
			</div>
		</div>
	);
}
