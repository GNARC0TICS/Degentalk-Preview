import React, { useState } from 'react';
import { ArrowUpRight, Check, Lock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { walletApiService } from '@/features/wallet/services/wallet-api.service';

export interface WithdrawButtonProps {
	variant?: 'default' | 'small';
	className?: string;
	onClick?: () => void;
}

export function WithdrawButton({
	variant = 'default',
	className = '',
	onClick
}: WithdrawButtonProps) {
	const [activeTab, setActiveTab] = useState('crypto');
	const [withdrawAddress, setWithdrawAddress] = useState('');
	const [withdrawAmount, setWithdrawAmount] = useState('');
	const [isWithdrawing, setIsWithdrawing] = useState(false);
	const [withdrawSuccess, setWithdrawSuccess] = useState(false);
	const [addressValidated, setAddressValidated] = useState(false);
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const { balance, walletConfig } = useWallet();

	// Get balances from the wallet hook
	const dgtBalance = balance?.dgt?.balance || 0;
	const cryptoBalance = balance?.crypto || [];
	const totalCryptoValue = cryptoBalance.reduce(
		(sum, crypto) => sum + parseFloat(crypto.balance),
		0
	);

	// Feature gates
	const canWithdrawCrypto = walletConfig?.features?.allowCryptoWithdrawals ?? false;
	const canSpendDGT = walletConfig?.features?.allowDGTSpending ?? false;

	const withdrawMutation = useMutation({
		mutationFn: async (data: { amount: number; currency: string; address?: string }) => {
			return walletApiService.requestWithdrawal(data.amount, data.currency, data.address || '');
		},
		onMutate: () => {
			setIsWithdrawing(true);
		},
		onSuccess: (_, variables) => {
			setIsWithdrawing(false);
			setWithdrawSuccess(true);
			setWithdrawAmount('');
			setWithdrawAddress('');

			queryClient.invalidateQueries({ queryKey: ['/api/wallet/balances'] });
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });

			// Success toast
			toast({
				title: 'Withdrawal Requested',
				description: `Your withdrawal of ${variables.amount} ${variables.currency} has been submitted and is being processed.`,
				variant: 'default'
			});

			// Reset success state after a delay
			setTimeout(() => {
				setWithdrawSuccess(false);
			}, 3000);
		},
		onError: (error) => {
			setIsWithdrawing(false);

			toast({
				title: 'Withdrawal Failed',
				description: error instanceof Error ? error.message : 'Please try again later.',
				variant: 'destructive'
			});
		}
	});

	const handleWithdraw = () => {
		const amount = parseFloat(withdrawAmount);

		if (isNaN(amount) || amount <= 0) {
			toast({
				title: 'Invalid Amount',
				description: 'Please enter a valid withdrawal amount',
				variant: 'destructive'
			});
			return;
		}

		if (activeTab === 'crypto') {
			// Check feature gate
			if (!canWithdrawCrypto) {
				toast({
					title: 'Feature Disabled',
					description: 'Crypto withdrawals are currently disabled',
					variant: 'destructive'
				});
				return;
			}

			// Check crypto balance
			if (amount > totalCryptoValue) {
				toast({
					title: 'Insufficient Balance',
					description: 'Your crypto balance is too low for this withdrawal',
					variant: 'destructive'
				});
				return;
			}

			// Check withdrawal address
			if (!withdrawAddress || withdrawAddress.trim().length < 10) {
				toast({
					title: 'Invalid Address',
					description: 'Please enter a valid wallet address',
					variant: 'destructive'
				});
				return;
			}

			// Check minimum withdrawal
			const minWithdraw = walletConfig?.dgt?.minDepositUSD || 1;
			if (amount < minWithdraw) {
				toast({
					title: 'Amount Too Low',
					description: `Minimum withdrawal is $${minWithdraw} USD value`,
					variant: 'destructive'
				});
				return;
			}
		} else {
			// Check feature gate
			if (!canSpendDGT) {
				toast({
					title: 'Feature Disabled',
					description: 'DGT spending is currently disabled',
					variant: 'destructive'
				});
				return;
			}

			// Check DGT balance
			if (amount > dgtBalance) {
				toast({
					title: 'Insufficient Balance',
					description: 'Your DGT balance is too low for this conversion',
					variant: 'destructive'
				});
				return;
			}

			// Check minimum conversion
			const minDGTConversion = 100; // 100 DGT minimum
			if (amount < minDGTConversion) {
				toast({
					title: 'Amount Too Low',
					description: `Minimum DGT conversion is ${minDGTConversion} DGT`,
					variant: 'destructive'
				});
				return;
			}
		}

		// Process withdrawal
		withdrawMutation.mutate({
			amount,
			currency: activeTab === 'crypto' ? 'USDT' : 'DGT',
			address: activeTab === 'crypto' ? withdrawAddress || undefined : undefined
		});
	};

	const validateAddress = () => {
		if (withdrawAddress && withdrawAddress.trim().length >= 30) {
			// This would be a real validation in production
			const isValid = withdrawAddress.startsWith('T') && withdrawAddress.length >= 30;

			setAddressValidated(isValid);

			if (isValid) {
				toast({
					title: 'Address Validated',
					description: 'Your withdrawal address appears to be valid',
					variant: 'default'
				});
			} else {
				toast({
					title: 'Invalid Address',
					description: 'Please enter a valid Tron (TRC-20) address',
					variant: 'destructive'
				});
			}
		} else {
			setAddressValidated(false);
			toast({
				title: 'Invalid Address',
				description: 'Please enter a complete wallet address',
				variant: 'destructive'
			});
		}
	};

	const setMaxAmount = () => {
		if (activeTab === 'crypto') {
			setWithdrawAmount(totalCryptoValue.toString());
		} else {
			setWithdrawAmount(dgtBalance.toString());
		}
	};

	// Small variant for compact displays
	if (variant === 'small') {
		const isDisabled = !canWithdrawCrypto && !canSpendDGT;
		return (
			<Button
				variant="secondary"
				size="sm"
				leftIcon={isDisabled ? <Lock className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
				className={className}
				onClick={onClick}
				disabled={isDisabled}
				title={isDisabled ? 'Withdrawals are currently disabled' : undefined}
			>
				{isDisabled ? 'Disabled' : 'Withdraw'}
			</Button>
		);
	}

	return (
		<div
			className={`bg-black/30 rounded-lg p-4 border border-zinc-800 shadow-lg space-y-4 ${className}`}
		>
			<h3 className="text-lg font-medium text-white mb-2">Withdraw Funds</h3>
			<p className="text-zinc-400 text-sm">
				{!canWithdrawCrypto && !canSpendDGT ? (
					<span className="text-red-400 flex items-center">
						<Lock className="h-4 w-4 mr-1" />
						Withdrawals are currently disabled
					</span>
				) : (
					'Withdraw your crypto or convert DGT to exclusive items in our shop.'
				)}
			</p>

			{(canWithdrawCrypto || canSpendDGT) && (
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="w-full grid grid-cols-2 bg-zinc-900">
						<TabsTrigger
							value="crypto"
							className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-white"
							disabled={!canWithdrawCrypto}
						>
							{!canWithdrawCrypto && <Lock className="h-3 w-3 mr-1" />}
							Crypto
							<Badge variant="outline" className="ml-2 bg-zinc-900 text-emerald-500">
								${totalCryptoValue?.toFixed(2) || '0.00'}
							</Badge>
						</TabsTrigger>
						<TabsTrigger
							value="dgt"
							className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-white"
							disabled={!canSpendDGT}
						>
							{!canSpendDGT && <Lock className="h-3 w-3 mr-1" />}
							DGT
							<Badge variant="outline" className="ml-2 bg-zinc-900 text-amber-500">
								{dgtBalance?.toFixed(2) || '0.00'}
							</Badge>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="crypto" className="space-y-4 mt-4">
						<div>
							<h4 className="text-sm text-zinc-400 mb-2">Withdrawal Amount (USD Value)</h4>
							<div className="flex items-center space-x-2">
								<Input
									type="number"
									placeholder="0.00"
									value={withdrawAmount}
									onChange={(e) => setWithdrawAmount(e.target.value)}
									variant="wallet"
									min={walletConfig?.dgt?.minDepositUSD || 1}
									max={totalCryptoValue}
									className="flex-1 focus:border-emerald-800/70"
									disabled={!canWithdrawCrypto}
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={setMaxAmount}
									className="whitespace-nowrap"
									disabled={!canWithdrawCrypto}
								>
									Max
								</Button>
							</div>
							<p className="text-xs text-zinc-500 mt-1">
								Minimum withdrawal: ${walletConfig?.dgt?.minDepositUSD || 1} USD
							</p>
						</div>

						<div>
							<h4 className="text-sm text-zinc-400 mb-2">Withdrawal Address</h4>
							<div className="flex items-center space-x-2">
								<Input
									placeholder="Enter your wallet address"
									value={withdrawAddress}
									onChange={(e) => setWithdrawAddress(e.target.value)}
									variant="wallet"
									className="flex-1 focus:border-emerald-800/70"
									disabled={!canWithdrawCrypto}
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={validateAddress}
									className="whitespace-nowrap"
									disabled={!canWithdrawCrypto}
								>
									Validate
								</Button>
							</div>
							<p className="text-xs text-zinc-500 mt-1">
								{addressValidated ? (
									<span className="text-emerald-500 flex items-center">
										<Check className="h-3 w-3 mr-1" /> Address validated
									</span>
								) : (
									'Enter the wallet address where you want to receive your crypto'
								)}
							</p>
						</div>
					</TabsContent>

					<TabsContent value="dgt" className="space-y-4 mt-4">
						<div>
							<h4 className="text-sm text-zinc-400 mb-2">Convert DGT</h4>
							<div className="flex items-center space-x-2">
								<Input
									type="number"
									placeholder="0"
									value={withdrawAmount}
									onChange={(e) => setWithdrawAmount(e.target.value)}
									variant="wallet"
									min={100}
									max={dgtBalance}
									className="flex-1 focus:border-amber-800/70"
									disabled={!canSpendDGT}
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={setMaxAmount}
									className="whitespace-nowrap"
									disabled={!canSpendDGT}
								>
									Max
								</Button>
							</div>
							<p className="text-xs text-zinc-500 mt-1">Minimum conversion: 100 DGT</p>
						</div>

						<div className="bg-zinc-900/50 p-3 rounded-lg">
							<h4 className="text-sm text-zinc-300 mb-2">Convert DGT to Shop Credits</h4>
							<p className="text-xs text-zinc-500">
								DGT can be converted to shop credits for purchasing exclusive items, badges, frames,
								and other special perks in our marketplace.
							</p>
						</div>
					</TabsContent>
				</Tabs>
			)}

			{(canWithdrawCrypto || canSpendDGT) && (
				<div className="flex justify-end pt-2">
					<Button
						variant={activeTab === 'dgt' ? 'xp' : 'secondary'}
						leftIcon={<ArrowUpRight className="h-4 w-4" />}
						onClick={handleWithdraw}
						isLoading={isWithdrawing}
						disabled={
							withdrawSuccess ||
							!withdrawAmount ||
							isNaN(parseFloat(withdrawAmount)) ||
							parseFloat(withdrawAmount) <= 0 ||
							(activeTab === 'crypto' &&
								(!canWithdrawCrypto ||
									parseFloat(withdrawAmount) > totalCryptoValue ||
									parseFloat(withdrawAmount) < (walletConfig?.dgt?.minDepositUSD || 1) ||
									!withdrawAddress ||
									withdrawAddress.trim().length < 10)) ||
							(activeTab === 'dgt' &&
								(!canSpendDGT ||
									parseFloat(withdrawAmount) > dgtBalance ||
									parseFloat(withdrawAmount) < 100))
						}
						className="transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] active:scale-95"
					>
						{withdrawSuccess
							? 'Request Submitted'
							: `${activeTab === 'crypto' ? 'Withdraw' : 'Convert'} ${activeTab.toUpperCase()}`}
					</Button>
				</div>
			)}

			<div className="bg-black/50 rounded-lg p-3 text-xs border border-zinc-800">
				<h4 className="text-zinc-400 font-medium mb-1">Information</h4>
				{!canWithdrawCrypto && !canSpendDGT ? (
					<ul className="list-disc pl-5 space-y-1 text-zinc-500">
						<li>Withdrawals are currently disabled by administrator.</li>
						<li>Contact support for more information.</li>
					</ul>
				) : activeTab === 'crypto' ? (
					<ul className="list-disc pl-5 space-y-1 text-zinc-500">
						<li>Crypto withdrawals are processed within 24 hours.</li>
						<li>
							Minimum withdrawal amount is ${walletConfig?.dgt?.minDepositUSD || 1} USD value.
						</li>
						<li>Ensure the receiving address is correct - wrong addresses cannot be recovered.</li>
						<li>
							{canWithdrawCrypto
								? 'Withdrawals are enabled.'
								: 'Crypto withdrawals are currently disabled.'}
						</li>
					</ul>
				) : (
					<ul className="list-disc pl-5 space-y-1 text-zinc-500">
						<li>DGT can be converted to shop credits at a 1:1 ratio.</li>
						<li>Shop credits can be used to purchase exclusive items and perks.</li>
						<li>Minimum conversion amount is 100 DGT.</li>
						<li>
							{canSpendDGT ? 'DGT spending is enabled.' : 'DGT spending is currently disabled.'}
						</li>
					</ul>
				)}
			</div>
		</div>
	);
}
