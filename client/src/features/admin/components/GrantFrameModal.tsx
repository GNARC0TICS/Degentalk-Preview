import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogDescription,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';
import { LoadingSpinner } from '@/components/ui/loader';
import type { AvatarFrame } from '@/types/compat/avatar';
import type { FrameId, UserId } from '@shared/types/ids';
import { toId, parseId } from '@shared/utils/id';

interface Props {
	frame: AvatarFrame | null;
	open: boolean;
	onClose: () => void;
	onSuccess?: (() => void) | undefined;
}

/**
 * GrantFrameModal – grants an avatar frame to a list of user IDs.
 * Usage:
 * <GrantFrameModal frame={frame} open={!!frame} onClose={...} onSuccess={...} />
 */
export const GrantFrameModal: React.FC<Props> = ({ frame, open, onClose, onSuccess }) => {
	const { toast } = useToast();
	const [userIds, setUserIds] = useState('');

	const grantMutation = useMutation<void, Error, { frameId: FrameId; userIds: UserId[] }>({
		mutationFn: ({ frameId, userIds }) =>
			apiRequest({
				url: `/api/admin/avatar-frames/${frameId}/grant`,
				method: 'POST',
				data: { userIds }
			}),
		onSuccess: () => {
			toast({ title: 'Success', description: 'Frame granted to users!' });
			setUserIds('');
			onSuccess?.();
			onClose();
		},
		onError: (e) => {
			toast({ title: 'Error', description: e.message, variant: 'destructive' });
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!frame) return;
		const ids = userIds
			.split(/[,\n]/)
			.map((s) => s.trim())
			.filter(Boolean);
		if (ids.length === 0) {
			toast({
				title: 'Error',
				description: 'Please enter at least one user ID',
				variant: 'destructive'
			});
			return;
		}
		const convertedIds = ids.map((id) => parseId<'UserId'>(id) || toId<'UserId'>(id));
		grantMutation.mutate({ frameId: frame.id, userIds: convertedIds });
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Grant Frame: {frame?.name}</DialogTitle>
					<DialogDescription>Enter user IDs (comma or newline separated)</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					<Textarea
						value={userIds}
						onChange={(e) => setUserIds(e.target.value)}
						placeholder="uuid-1, uuid-2, uuid-3"
						rows={4}
						className="resize-none"
					/>

					<DialogFooter>
						<Button type="submit" disabled={grantMutation.isPending} className="w-full">
							{grantMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : null}
							Grant Frame
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
