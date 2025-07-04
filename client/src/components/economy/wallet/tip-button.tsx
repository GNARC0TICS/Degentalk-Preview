import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { UserId } from '@shared/types';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useTip } from '@/hooks/use-tip';
import { useWallet } from '@/hooks/use-wallet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Coins } from 'lucide-react';
import * as z from 'zod';

const tipFormSchema = z.object({
	amount: z.number().min(1, {
		message: 'Tip amount must be at least 1 DGT'
	}),
	message: z.string().optional()
});

type TipFormValues = z.infer<typeof tipFormSchema>;

interface TipButtonProps {
	recipientId: UserId;
	recipientName: string;
	buttonText?: string;
	buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
	buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
	className?: string;
	source?: string;
}

/**
 * TipButton Component
 *
 * Allows users to send DGT tips to other users
 * Uses the new wallet and tip hooks for functionality
 *
 * // [REFAC-DGT]
 */
export default function TipButton({
	recipientId,
	recipientName,
	buttonText = 'Tip',
	buttonVariant = 'secondary',
	buttonSize = 'sm',
	className = '',
	source = 'forum'
}: TipButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { sendTip, isSendingTip } = useTip();
	const { balance, isLoadingBalance } = useWallet();
	const { toast } = useToast();

	const maxAmount = balance?.dgt || 0;

	const form = useForm<TipFormValues>({
		resolver: zodResolver(tipFormSchema),
		defaultValues: {
			amount: 10,
			message: ''
		}
	});

	function onSubmit(values: TipFormValues) {
		if (values.amount > maxAmount) {
			toast({
				variant: 'destructive',
				title: 'Insufficient balance',
				description: `You don't have enough DGT to send this tip. Your balance: ${maxAmount} DGT`
			});
			return;
		}

		sendTip(
			{
				toUserId: recipientId,
				amount: values.amount,
				reason: values.message,
				source
			},
			{
				onSuccess: () => {
					setIsOpen(false);
					form.reset();
				}
			}
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant={buttonVariant} size={buttonSize} className={className}>
					<Coins className="h-4 w-4" />
					{buttonText && <span>{buttonText}</span>}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Send a Tip to {recipientName}</DialogTitle>
					<DialogDescription>
						Show your appreciation by sending DGT tokens as a tip.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount (DGT)</FormLabel>
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
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Message (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Add a message with your tip"
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormDescription>Your message will be visible to the recipient.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSendingTip || isLoadingBalance || maxAmount === 0}>
								{isSendingTip ? 'Sending...' : 'Send Tip'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
