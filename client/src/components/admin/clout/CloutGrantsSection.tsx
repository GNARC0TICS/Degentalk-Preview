import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Zap, User, DollarSign, Gift, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CloutGrantsSectionProps {
	isLoading: boolean;
}

const grantSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	amount: z
		.number()
		.min(-10000, 'Amount must be greater than -10,000')
		.max(10000, 'Amount must be less than 10,000'),
	reason: z.string().min(1, 'Reason is required').max(255)
});

type GrantForm = z.infer<typeof grantSchema>;

const QUICK_GRANT_AMOUNTS = [
	{ label: '+10 Clout', value: 10, color: 'bg-green-500', icon: '👍' },
	{ label: '+25 Clout', value: 25, color: 'bg-green-600', icon: '⭐' },
	{ label: '+50 Clout', value: 50, color: 'bg-blue-500', icon: '💎' },
	{ label: '+100 Clout', value: 100, color: 'bg-purple-500', icon: '🏆' },
	{ label: '+250 Clout', value: 250, color: 'bg-yellow-500', icon: '👑' },
	{ label: '-10 Clout', value: -10, color: 'bg-red-400', icon: '👎' },
	{ label: '-25 Clout', value: -25, color: 'bg-red-500', icon: '⚠️' },
	{ label: '-50 Clout', value: -50, color: 'bg-red-600', icon: '🚫' }
];

const COMMON_REASONS = [
	'Exceptional contribution to community',
	'High-quality content creation',
	'Helping other users',
	'Reporting important issues',
	'Community event participation',
	'Moderator appreciation',
	'Special recognition',
	'Violation of community guidelines',
	'Spam or low-quality content',
	'Inappropriate behavior',
	'Manual adjustment',
	'Other (see details)'
];

export function CloutGrantsSection({ isLoading }: CloutGrantsSectionProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

	const form = useForm<GrantForm>({
		resolver: zodResolver(grantSchema),
		defaultValues: {
			userId: '',
			amount: 10,
			reason: ''
		}
	});

	// Grant clout mutation
	const grantCloutMutation = useMutation({
		mutationFn: async (data: GrantForm) => {
			return apiRequest({
				url: '/api/admin/clout/grants',
				method: 'POST',
				data
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-clout-logs'] });
			form.reset();
			setSelectedQuickAmount(null);
			toast({
				title: 'Clout Granted',
				description: 'Clout has been successfully granted to the user.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Grant Failed',
				description: error.message || 'Failed to grant clout',
				variant: 'destructive'
			});
		}
	});

	const handleQuickGrant = (amount: number) => {
		setSelectedQuickAmount(amount);
		form.setValue('amount', amount);

		// Set default reason based on amount
		if (amount > 0) {
			form.setValue(
				'reason',
				amount >= 100 ? 'Exceptional contribution to community' : 'High-quality content creation'
			);
		} else {
			form.setValue('reason', 'Violation of community guidelines');
		}
	};

	const onSubmit = (data: GrantForm) => {
		grantCloutMutation.mutate(data);
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex justify-center">
						<p>Loading grant tools...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5" />
						Manual Clout Grants
					</CardTitle>
					<CardDescription>
						Grant or deduct clout from users for special circumstances, violations, or recognition
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Quick Grant Buttons */}
					<div>
						<h3 className="font-semibold mb-3">Quick Grant Amounts</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{QUICK_GRANT_AMOUNTS.map((quickGrant) => (
								<Button
									key={quickGrant.value}
									variant={selectedQuickAmount === quickGrant.value ? 'default' : 'outline'}
									className={`h-auto p-3 flex flex-col items-center gap-2 ${
										selectedQuickAmount === quickGrant.value ? '' : 'hover:bg-accent'
									}`}
									onClick={() => handleQuickGrant(quickGrant.value)}
								>
									<span className="text-lg">{quickGrant.icon}</span>
									<span className="text-sm font-medium">{quickGrant.label}</span>
								</Button>
							))}
						</div>
					</div>

					{/* Grant Form */}
					<div>
						<h3 className="font-semibold mb-3">Grant Details</h3>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="userId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>User ID</FormLabel>
												<FormControl>
													<Input placeholder="Enter user UUID" {...field} className="font-mono" />
												</FormControl>
												<FormDescription>
													The UUID of the user to grant/deduct clout from
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="amount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Clout Amount</FormLabel>
												<FormControl>
													<Input
														type="number"
														min="-10000"
														max="10000"
														{...field}
														onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
														className={`${field.value < 0 ? 'text-red-600' : 'text-green-600'} font-semibold`}
													/>
												</FormControl>
												<FormDescription>
													Positive numbers grant clout, negative numbers deduct clout
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="reason"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Reason</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Explain why this clout is being granted or deducted"
													{...field}
													rows={3}
												/>
											</FormControl>
											<FormDescription>
												This reason will be logged and may be visible to the user
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Common Reasons */}
								<div>
									<label className="text-sm font-medium mb-2 block">Common Reasons</label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
										{COMMON_REASONS.map((reason) => (
											<Button
												key={reason}
												type="button"
												variant="outline"
												size="sm"
												className="justify-start text-left h-auto p-2"
												onClick={() => form.setValue('reason', reason)}
											>
												<span className="text-xs">{reason}</span>
											</Button>
										))}
									</div>
								</div>

								{/* Preview */}
								{(form.watch('userId') || form.watch('amount') || form.watch('reason')) && (
									<div className="p-4 border rounded-md bg-muted/50">
										<h4 className="font-semibold mb-2 flex items-center gap-2">
											<Gift className="h-4 w-4" />
											Grant Preview
										</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span>User:</span>
												<span className="font-mono">{form.watch('userId') || 'Not specified'}</span>
											</div>
											<div className="flex justify-between">
												<span>Amount:</span>
												<span
													className={`font-semibold ${
														form.watch('amount') < 0 ? 'text-red-600' : 'text-green-600'
													}`}
												>
													{form.watch('amount') > 0 ? '+' : ''}
													{form.watch('amount')} clout
												</span>
											</div>
											<div className="flex justify-between">
												<span>Reason:</span>
												<span className="text-right max-w-48 truncate">
													{form.watch('reason') || 'Not specified'}
												</span>
											</div>
										</div>
									</div>
								)}

								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											form.reset();
											setSelectedQuickAmount(null);
										}}
									>
										Clear Form
									</Button>
									<Button
										type="submit"
										disabled={grantCloutMutation.isPending}
										className={form.watch('amount') < 0 ? 'bg-red-600 hover:bg-red-700' : ''}
									>
										{grantCloutMutation.isPending
											? 'Processing...'
											: form.watch('amount') < 0
												? 'Deduct Clout'
												: 'Grant Clout'}
									</Button>
								</div>
							</form>
						</Form>
					</div>
				</CardContent>
			</Card>

			{/* Grant Guidelines */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-yellow-500" />
						Clout Grant Guidelines
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 className="font-semibold text-green-600 mb-2 flex items-center gap-1">
								<Zap className="h-4 w-4" />
								Positive Clout Grants
							</h4>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• Exceptional community contributions</li>
								<li>• High-quality content creation</li>
								<li>• Helping other users significantly</li>
								<li>• Reporting critical platform issues</li>
								<li>• Event participation and engagement</li>
								<li>• Going above and beyond community standards</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-red-600 mb-2 flex items-center gap-1">
								<AlertTriangle className="h-4 w-4" />
								Negative Clout Deductions
							</h4>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• Violations of community guidelines</li>
								<li>• Spam or consistently low-quality content</li>
								<li>• Inappropriate behavior or harassment</li>
								<li>• Abuse of platform features</li>
								<li>• Repeated rule violations</li>
								<li>• Disrupting community discussions</li>
							</ul>
						</div>
					</div>

					<div className="pt-4 border-t">
						<h4 className="font-semibold mb-2">Best Practices</h4>
						<ul className="space-y-1 text-sm text-muted-foreground">
							<li>• Always provide a clear, specific reason for grants/deductions</li>
							<li>• Consider the user's overall contribution history</li>
							<li>• Use proportionate amounts for the action being recognized/penalized</li>
							<li>• Document significant grants in moderation logs</li>
							<li>• Be consistent with similar situations across users</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
