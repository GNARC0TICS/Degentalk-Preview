import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { useGrantClout, useCloutLogs } from '@/features/admin/services/cloutGrantsService';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

interface UserSearchResult {
	id: string;
	username: string;
	avatarUrl: string | null;
}

export default function CloutGrantsAdminPage() {
	const { toast } = useToast();
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedTerm = useDebounce(searchTerm, 300);
	const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
	const [amount, setAmount] = useState<number>(100);
	const [reason, setReason] = useState<string>('');

	const grantMutation = useGrantClout();
	const { data: logsData } = useCloutLogs(selectedUser?.id);

	// Quick user search query
	const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	async function searchUsers(term: string) {
		if (term.length < 3) {
			setSearchResults([]);
			return;
		}
		setIsSearching(true);
		try {
			const res = await fetch(`/api/admin/users/search?term=${encodeURIComponent(term)}`);
			const json = await res.json();
			setSearchResults(json.users || []);
		} finally {
			setIsSearching(false);
		}
	}

	// Trigger search when debounced term changes
	useEffect(() => {
		if (debouncedTerm) {
			searchUsers(debouncedTerm);
		} else {
			setSearchResults([]);
		}
	}, [debouncedTerm]);

	const handleGrant = () => {
		if (!selectedUser) return;
		grantMutation.mutate(
			{ userId: selectedUser.id, amount, reason },
			{
				onSuccess: () => {
					toast({
						title: 'Clout granted',
						description: `User ${selectedUser.username} received ${amount} clout.`
					});
					setAmount(100);
					setReason('');
				},
				onError: (err: any) => {
					toast({
						title: 'Error',
						description: err.message || 'Failed to grant clout',
						variant: 'destructive'
					});
				}
			}
		);
	};

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<h2 className="text-3xl font-bold tracking-tight">Clout Grants</h2>

			{/* User search & grant form */}
			<Card>
				<CardHeader>
					<CardTitle>Grant Clout to User</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-4 items-end flex-wrap">
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium">Search User</label>
							<Input
								placeholder="username…"
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setSelectedUser(null);
								}}
							/>
							{isSearching && <span className="text-xs text-muted-foreground">Searching…</span>}
							{searchResults.length > 0 && !selectedUser && (
								<div className="border rounded-md max-h-40 overflow-auto bg-white dark:bg-gray-800 shadow-md">
									{searchResults.map((u) => (
										<div
											key={u.id}
											onClick={() => {
												setSelectedUser(u);
												setSearchResults([]);
												setSearchTerm(u.username);
											}}
											className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
										>
											{u.username}
										</div>
									))}
								</div>
							)}
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium">Amount</label>
							<Input
								type="number"
								min={1}
								value={amount}
								onChange={(e) => setAmount(Number(e.target.value))}
							/>
						</div>

						<div className="flex flex-col gap-1 flex-1 min-w-[200px]">
							<label className="text-sm font-medium">Reason</label>
							<Input value={reason} onChange={(e) => setReason(e.target.value)} />
						</div>

						<Button disabled={!selectedUser || grantMutation.isLoading} onClick={handleGrant}>
							Grant
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Grant logs */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Grants {selectedUser ? `for ${selectedUser.username}` : ''}</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Reason</TableHead>
								<TableHead>Time</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{logsData?.logs?.map((log: any) => (
								<tr key={log.id} className="border-b text-sm">
									<td className="p-2 font-mono text-xs">{log.userId}</td>
									<td className="p-2">{log.cloutEarned}</td>
									<td className="p-2">{log.reason}</td>
									<td className="p-2">
										{new Date(log.createdAt).toLocaleString(undefined, { hour12: false })}
									</td>
								</tr>
							))}
							{logsData?.logs?.length === 0 && (
								<tr>
									<td className="p-2">No logs found.</td>
								</tr>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
