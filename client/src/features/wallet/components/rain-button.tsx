import { useState } from 'react';
import { Button } from '@app/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@app/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@app/components/ui/form';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Slider } from '@app/components/ui/slider';
import { useToast } from '@app/hooks/use-toast';
import { useRain } from '@app/hooks/use-rain';
import { useWallet } from '@app/hooks/use-wallet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@app/components/ui/select';

const rainFormSchema = z.object({
	amount: z.number().min(1, {
		message: 'Rain amount must be at least 1 DGT'
	}),
	eligibleUserCount: z
		.number()
		.min(1, {
			message: 'Must include at least 1 user'
		})
		.max(50, {
			message: 'Cannot include more than 50 users'
		}),
	channel: z.string(),
	message: z.string().optional()
});

type RainFormValues = z.infer<typeof rainFormSchema>;

interface RainButtonProps {
	buttonText?: string;
	buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
	buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
	className?: string;
	defaultChannel?: string;
}

/**
 * RainButton Component
 *
 * Allows users to send DGT rain to multiple active users at once
 * Uses the new wallet and rain hooks for functionality
 *
 * // [REFAC-DGT]
 */
export default function RainButton({
	buttonText = 'Make it Rain',
	buttonVariant = 'secondary',
	buttonSize = 'default',
	className = '',
	defaultChannel = 'general'
}: RainButtonProps) {
	const { toast } = useToast(); // Get toast from the hook
	const [isOpen, setIsOpen] = useState(false);
	const { sendRain, isSendingRain } = useRain();
	const { balance, isLoadingBalance } = useWallet();

	const maxAmount = balance?.dgt || 0;

	const form = useForm<RainFormValues>({
		resolver: zodResolver(rainFormSchema),
		defaultValues: {
			amount: 50,
			eligibleUserCount: 5,
			channel: defaultChannel,
			message: ''
		}
	});

	function onSubmit(values: RainFormValues) {
		if (values.amount > maxAmount) {
			toast({
				variant: 'destructive',
				title: 'Insufficient balance',
				description: `You don't have enough DGT to send this rain. Your balance: ${maxAmount} DGT`
			});
			return;
		}

		// Check if the amount per user is at least 1 DGT
		const amountPerUser = Math.floor(values.amount / values.eligibleUserCount);
		if (amountPerUser < 1) {
			toast({
				variant: 'destructive',
				title: 'Amount too small',
				description: `Each user must receive at least 1 DGT. Please increase the amount or reduce the number of recipients.`
			});
			return;
		}

		sendRain(
			{
				amount: values.amount,
				eligibleUserCount: values.eligibleUserCount,
				message: values.message
			},
			{
				onSuccess: () => {
					setIsOpen(false);
					form.reset({
						amount: 50,
						eligibleUserCount: 5,
						channel: defaultChannel,
						message: ''
					});
				}
			}
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant={buttonVariant} size={buttonSize} className={className}>
					{buttonText}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Make it Rain DGT</DialogTitle>
					<DialogDescription>
						Distribute DGT tokens to multiple active users at once.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Total Amount (DGT)</FormLabel>
									<FormControl>
										<div className="space-y-3">
											<Slider
												disabled={isLoadingBalance || maxAmount === 0}
												min={1}
												max={Math.min(maxAmount, 1000)}
												step={1}
												value={[field.value]}
												onValueChange={(value) => field.onChange(value[0])}
											/>
											<div className="flex items-center space-x-3">
												<Input
													type="number"
													value={field.value}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
													className="w-24"
													min={1}
													max={maxAmount}
													disabled={isLoadingBalance || maxAmount === 0}
												/>
												<span className="text-sm text-muted-foreground">
													{isLoadingBalance ? 'Loading balance...' : `Available: ${maxAmount} DGT`}
												</span>
											</div>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="eligibleUserCount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Number of Recipients</FormLabel>
									<FormControl>
										<div className="space-y-3">
											<Slider
												min={1}
												max={50}
												step={1}
												value={[field.value]}
												onValueChange={(value) => field.onChange(value[0])}
											/>
											<div className="flex items-center space-x-3">
												<Input
													type="number"
													value={field.value}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
													className="w-24"
													min={1}
													max={50}
												/>
												<span className="text-sm text-muted-foreground">
													{`Each user will receive ~${Math.floor(form.watch('amount') / field.value)} DGT`}
												</span>
											</div>
										</div>
									</FormControl>
									<FormDescription>
										The total amount will be distributed among this many active users.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="channel"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Channel</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a channel" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="general">General</SelectItem>
											<SelectItem value="trading">Trading</SelectItem>
											<SelectItem value="defi">DeFi</SelectItem>
											<SelectItem value="nft">NFT</SelectItem>
											<SelectItem value="gaming">Gaming</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Only users active in this channel will be eligible.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Message (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Add a message with your rain"
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Your message will be displayed with the rain notification.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSendingRain || isLoadingBalance || maxAmount === 0}>
								{isSendingRain ? 'Sending...' : 'Make it Rain'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
