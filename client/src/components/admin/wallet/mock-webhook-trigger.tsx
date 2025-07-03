import { useState } from 'react';
import type { UserId } from '@/types/ids';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';

interface MockWebhookResponse {
	success: boolean;
	transactionId: string;
	message?: string;
}

/**
 * Mock Webhook Trigger Component
 *
 * Admin tool to simulate CCPayment webhooks for testing purposes
 * This allows admins to test the system's response to various webhook events
 * without needing real cryptocurrency transactions
 *
 * // [REFAC-CCPAYMENT]
 */
export function MockWebhookTrigger() {
	const { toast } = useToast();
	const [webhookType, setWebhookType] = useState<string>('deposit');
	const [amount, setAmount] = useState<string>('100');
	const [currency, setCurrency] = useState<string>('USDT');
	const [userId, setUserId] = useState<UserId | ''>('');
	const [mockTxHash, setMockTxHash] = useState<string>('');

	// Mutation to trigger mock webhook
	const triggerWebhookMutation = useMutation({
		mutationFn: async () => {
			try {
				return await apiRequest<MockWebhookResponse>({
					url: '/api/admin/wallet/trigger-mock-webhook',
					method: 'POST',
					data: {
						type: webhookType,
						amount: parseFloat(amount),
						currency,
						userId: userId || undefined,
						txHash: mockTxHash || undefined
					}
				});
			} catch (error) {
				console.error('Error triggering mock webhook:', error);
				throw error;
			}
		},
		onSuccess: (data) => {
			toast({
				variant: 'default',
				title: 'Mock Webhook Triggered',
				description: `Successfully triggered a ${webhookType} webhook. Transaction ID: ${data.transactionId}`
			});
		},
		onError: (error: any) => {
			toast({
				variant: 'destructive',
				title: 'Error Triggering Webhook',
				description: error?.message || 'Failed to trigger mock webhook. Please check your inputs.'
			});
		}
	});

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate inputs
		if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
			toast({
				variant: 'destructive',
				title: 'Invalid Amount',
				description: 'Please enter a valid positive number for the amount.'
			});
			return;
		}

		if (userId && userId.length === 0) {
			toast({
				variant: 'destructive',
				title: 'Invalid User ID',
				description: 'Please enter a valid user ID or leave it blank for random selection.'
			});
			return;
		}

		// Trigger the mock webhook
		triggerWebhookMutation.mutate();
	};

	// Generate a random transaction hash
	const generateRandomTxHash = () => {
		const chars = '0123456789abcdef';
		let hash = '0x';
		for (let i = 0; i < 64; i++) {
			hash += chars[Math.floor(Math.random() * chars.length)];
		}
		setMockTxHash(hash);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Trigger Mock CCPayment Webhook</CardTitle>
				<CardDescription>
					Simulate CCPayment webhooks for testing integration without real crypto transactions.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="webhook-type">Webhook Type</Label>
							<Select value={webhookType} onValueChange={setWebhookType}>
								<SelectTrigger id="webhook-type">
									<SelectValue placeholder="Select webhook type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="deposit">Deposit</SelectItem>
									<SelectItem value="withdrawal">Withdrawal</SelectItem>
									<SelectItem value="purchase">Purchase</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="currency">Currency</Label>
							<Select value={currency} onValueChange={setCurrency}>
								<SelectTrigger id="currency">
									<SelectValue placeholder="Select currency" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="USDT">USDT</SelectItem>
									<SelectItem value="TRX">TRX</SelectItem>
									<SelectItem value="BTC">BTC</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								type="number"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								min="0.01"
								step="0.01"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="user-id">User ID (Optional)</Label>
							<Input
								id="user-id"
								type="number"
								value={userId}
								onChange={(e) => setUserId(e.target.value as UserId | '')}
								placeholder="Random if empty"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between">
							<Label htmlFor="tx-hash">Transaction Hash</Label>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={generateRandomTxHash}
								className="h-5 text-xs"
							>
								Generate Random
							</Button>
						</div>
						<Input
							id="tx-hash"
							value={mockTxHash}
							onChange={(e) => setMockTxHash(e.target.value)}
							placeholder="Auto-generated if empty"
						/>
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button
					variant="outline"
					onClick={() => {
						setAmount('100');
						setCurrency('USDT');
						setUserId('');
						setMockTxHash('');
					}}
				>
					Reset
				</Button>
				<Button onClick={handleSubmit} disabled={triggerWebhookMutation.isPending}>
					{triggerWebhookMutation.isPending ? 'Triggering...' : 'Trigger Webhook'}
				</Button>
			</CardFooter>
		</Card>
	);
}
