import React, { useState } from 'react';
import {
	MoreVertical,
	Trash2,
	Lock,
	Unlock,
	Pin,
	Eye,
	EyeOff,
	AlertTriangle,
	FileText,
	User,
	Shield,
	CheckCircle
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useSolveThread, useUnsolveThread } from '@/features/forum/hooks/useForumQueries';
import type { ItemId } from '@shared/types';

interface ModeratorActionsProps {
	type: 'thread' | 'post';
	itemId: ItemId;
	itemData: {
		isLocked?: boolean;
		isSticky?: boolean;
		isHidden?: boolean;
		userId?: string;
		username?: string;
		isSolved?: boolean;
	};
	onActionComplete?: () => void;
	className?: string;
}

export function ModeratorActions({
	type,
	itemId,
	itemData,
	onActionComplete,
	className
}: ModeratorActionsProps) {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [moderatorNoteOpen, setModeratorNoteOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [moderatorNote, setModeratorNote] = useState('');

	// Check if user is moderator or admin
	const isModerator = user?.role === 'mod' || user?.role === 'admin';
	if (!isModerator) return null;

	// Thread actions
	const toggleLock = useMutation({
		mutationFn: async () => {
			return apiRequest({ url: `/api/forum/threads/${itemId}/${itemData.isLocked ? 'unlock' : 'lock'}`,
				method: 'POST'
			});
		},
		onSuccess: () => {
			toast({
				title: `Thread ${itemData.isLocked ? 'unlocked' : 'locked'}`,
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			onActionComplete?.();
		}
	});

	const togglePin = useMutation({
		mutationFn: async () => {
			return apiRequest({ url: `/api/forum/threads/${itemId}/${itemData.isSticky ? 'unpin' : 'pin'}`,
				method: 'POST'
			});
		},
		onSuccess: () => {
			toast({
				title: `Thread ${itemData.isSticky ? 'unpinned' : 'pinned'}`,
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			onActionComplete?.();
		}
	});

	const toggleHide = useMutation({
		mutationFn: async () => {
			return apiRequest({ url: `/api/forum/${type}s/${itemId}/${itemData.isHidden ? 'show' : 'hide'}`,
				method: 'POST'
			});
		},
		onSuccess: () => {
			toast({
				title: `${type === 'thread' ? 'Thread' : 'Post'} ${itemData.isHidden ? 'shown' : 'hidden'}`,
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: [`/api/forum/${type}s`] });
			onActionComplete?.();
		}
	});

	const deleteItem = useMutation({
		mutationFn: async () => {
			return apiRequest({ url: `/api/forum/${type}s/${itemId}`,
				method: 'DELETE',
				data: { reason: moderatorNote }
			});
		},
		onSuccess: () => {
			toast({
				title: `${type === 'thread' ? 'Thread' : 'Post'} deleted`,
				variant: 'destructive'
			});
			queryClient.invalidateQueries({ queryKey: [`/api/forum/${type}s`] });
			setDeleteConfirmOpen(false);
			setModeratorNote('');
			onActionComplete?.();
		}
	});

	const addModeratorNote = useMutation({
		mutationFn: async () => {
			return apiRequest({
				url: `/api/admin/moderator-notes`,
				method: 'POST',
				data: {
					type,
					itemId,
					note: moderatorNote
				}
			});
		},
		onSuccess: () => {
			toast({
				title: 'Moderator note added',
				variant: 'default'
			});
			setModeratorNoteOpen(false);
			setModeratorNote('');
		}
	});

	// Solve / Unsolve thread
	const solveThread = useSolveThread();
	const unsolveThread = useUnsolveThread();

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className={cn('h-8 w-8 p-0', className)}>
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Moderator actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="flex items-center gap-2">
						<Shield className="h-4 w-4" />
						Moderator Actions
					</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{/* Thread-specific actions */}
					{type === 'thread' && (
						<>
							<DropdownMenuItem onClick={() => toggleLock.mutate()}>
								{itemData.isLocked ? (
									<>
										<Unlock className="mr-2 h-4 w-4" />
										Unlock Thread
									</>
								) : (
									<>
										<Lock className="mr-2 h-4 w-4" />
										Lock Thread
									</>
								)}
							</DropdownMenuItem>

							<DropdownMenuItem onClick={() => togglePin.mutate()}>
								{itemData.isSticky ? (
									<>
										<Pin className="mr-2 h-4 w-4" />
										Unpin Thread
									</>
								) : (
									<>
										<Pin className="mr-2 h-4 w-4" />
										Pin Thread
									</>
								)}
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={() => {
									if (itemData.isSolved) {
										unsolveThread.mutate(itemId);
									} else {
										solveThread.mutate({ threadId: itemId });
									}
								}}
							>
								{itemData.isSolved ? (
									<>
										<AlertTriangle className="mr-2 h-4 w-4" />
										Unmark Solved
									</>
								) : (
									<>
										<CheckCircle className="mr-2 h-4 w-4" />
										Mark as Solved
									</>
								)}
							</DropdownMenuItem>

							<DropdownMenuSeparator />
						</>
					)}

					{/* Common actions */}
					<DropdownMenuItem onClick={() => toggleHide.mutate()}>
						{itemData.isHidden ? (
							<>
								<Eye className="mr-2 h-4 w-4" />
								Show {type === 'thread' ? 'Thread' : 'Post'}
							</>
						) : (
							<>
								<EyeOff className="mr-2 h-4 w-4" />
								Hide {type === 'thread' ? 'Thread' : 'Post'}
							</>
						)}
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => setModeratorNoteOpen(true)}>
						<FileText className="mr-2 h-4 w-4" />
						Add Moderator Note
					</DropdownMenuItem>

					{itemData.userId && (
						<DropdownMenuItem asChild>
							<a href={`/admin/users/${itemData.userId}`} target="_blank" rel="noopener">
								<User className="mr-2 h-4 w-4" />
								View User Info
							</a>
						</DropdownMenuItem>
					)}

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => setDeleteConfirmOpen(true)}
						className="text-red-500 focus:text-red-500"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete {type === 'thread' ? 'Thread' : 'Post'}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Moderator Note Dialog */}
			<Dialog open={moderatorNoteOpen} onOpenChange={setModeratorNoteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Moderator Note</DialogTitle>
						<DialogDescription>
							This note will be visible only to moderators and admins.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="mod-note">Note</Label>
							<Textarea
								id="mod-note"
								value={moderatorNote}
								onChange={(e) => setModeratorNote(e.target.value)}
								placeholder="Enter your moderator note..."
								rows={4}
							/>
						</div>
						{itemData.username && (
							<div className="text-sm text-zinc-400">
								<span>User: </span>
								<Badge variant="outline">{itemData.username}</Badge>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setModeratorNoteOpen(false);
								setModeratorNote('');
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => addModeratorNote.mutate()}
							disabled={!moderatorNote.trim() || addModeratorNote.isPending}
						>
							Add Note
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-500">
							<AlertTriangle className="h-5 w-5" />
							Delete {type === 'thread' ? 'Thread' : 'Post'}
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. The {type} will be permanently deleted.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="delete-reason">Reason for deletion (optional)</Label>
							<Textarea
								id="delete-reason"
								value={moderatorNote}
								onChange={(e) => setModeratorNote(e.target.value)}
								placeholder="Provide a reason for deletion..."
								rows={3}
							/>
						</div>
						{itemData.username && (
							<div className="p-3 bg-zinc-800 rounded-md">
								<p className="text-sm text-zinc-400">
									Author: <span className="text-zinc-200">{itemData.username}</span>
								</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteConfirmOpen(false);
								setModeratorNote('');
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteItem.mutate()}
							disabled={deleteItem.isPending}
						>
							Delete {type === 'thread' ? 'Thread' : 'Post'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
