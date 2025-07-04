import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
// Assuming you have this
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import type { GroupId } from '@shared/types';

// Types
interface UserGroup {
	id: GroupId;
	name: string;
	// Add other properties as needed from your userGroups schema
}

interface AirdropPayload {
	tokenType: 'XP' | 'DGT';
	amount: number;
	targetCriteria: {
		type: 'group' | 'userIds' | 'role'; // Extend as needed
		value: GroupId | string[] | string; // Group ID or array of User IDs or Role ID
	};
	note?: string;
}

const AdminAirdropPage: React.FC = () => {
	const { toast } = useToast();
	const [tokenType, setTokenType] = useState<'XP' | 'DGT'>('XP');
	const [amount, setAmount] = useState<number>(0);
	const [targetGroupId, setTargetGroupId] = useState<string>(''); // Store as string for Select component
	const [note, setNote] = useState<string>('');

	// Fetch user groups for the dropdown
	const { data: userGroups, isLoading: isLoadingGroups } = useQuery<UserGroup[]>({
		queryKey: ['adminUserGroups'],
		queryFn: async () => apiRequest({ url: '/api/admin/users/groups', method: 'GET' }) // TODO: Verify endpoint
	});

	// Mutation for submitting the airdrop
	const airdropMutation = useMutation({
		mutationFn: async (payload: AirdropPayload) => {
			// TODO: Implement the actual API call to /api/admin/airdrop
			return apiRequest({
				url: '/api/admin/airdrop',
				method: 'POST',
				data: payload
			});
		},
		onSuccess: (data) => {
			toast({
				title: 'Airdrop Successful',
				description: data?.message || 'The airdrop has been processed.'
			});
			// Optionally reset form or refetch related data
			setAmount(0);
			setTargetGroupId('');
			setNote('');
			queryClient.invalidateQueries({ queryKey: ['adminAirdropHistory'] });
		},
		onError: (error: any) => {
			toast({
				title: 'Airdrop Failed',
				description: error?.message || 'An unexpected error occurred.',
				variant: 'destructive'
			});
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!targetGroupId || amount <= 0) {
			toast({
				title: 'Invalid Input',
				description: 'Please select a target group and enter a valid amount.',
				variant: 'destructive'
			});
			return;
		}

		const payload: AirdropPayload = {
			tokenType,
			amount,
			targetCriteria: {
				type: 'group',
				value: targetGroupId
			},
			note
		};
		airdropMutation.mutate(payload);
	};

	return (
		<div className="container mx-auto py-8 px-4 md:px-6">
			<Card className="max-w-2xl mx-auto bg-black/40 backdrop-blur-sm border border-white/10 shadow-xl">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold">Admin Airdrop</CardTitle>
					<CardDescription>Distribute XP or DGT to users based on groups.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label htmlFor="tokenType">Token Type</Label>
								<Select
									onValueChange={(value) => setTokenType(value as 'XP' | 'DGT')}
									defaultValue={tokenType}
								>
									<SelectTrigger id="tokenType" className="mt-1">
										<SelectValue placeholder="Select token type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="XP">XP (Experience Points)</SelectItem>
										<SelectItem value="DGT">DGT (Digital Gold Token)</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="amount">Amount</Label>
								<Input
									id="amount"
									type="number"
									value={amount}
									onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
									placeholder="e.g., 100"
									className="mt-1"
									min="1"
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="targetGroup">Target Group</Label>
							<Select
								onValueChange={setTargetGroupId}
								value={targetGroupId}
								disabled={isLoadingGroups}
							>
								<SelectTrigger id="targetGroup" className="mt-1">
									<SelectValue
										placeholder={isLoadingGroups ? 'Loading groups...' : 'Select target group'}
									/>
								</SelectTrigger>
								<SelectContent>
									{userGroups && userGroups.length > 0 ? (
										userGroups.map((group) => (
											<SelectItem key={group.id} value={String(group.id)}>
												{group.name}
											</SelectItem>
										))
									) : (
										<SelectItem value="" disabled>
											{isLoadingGroups ? 'Loading...' : 'No groups found or failed to load'}
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="note">Notes (Optional)</Label>
							<Textarea
								id="note"
								value={note}
								onChange={(e) => setNote(e.target.value)}
								placeholder="Reason for this airdrop (e.g., Holiday bonus, contest winner)"
								className="mt-1"
								rows={3}
							/>
						</div>
					</CardContent>
					<CardFooter className="border-t border-white/10 px-6 py-4">
						<Button
							type="submit"
							disabled={airdropMutation.isPending || isLoadingGroups}
							className="ml-auto"
						>
							{airdropMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								<>
									<Send className="mr-2 h-4 w-4" />
									Execute Airdrop
								</>
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default AdminAirdropPage;
