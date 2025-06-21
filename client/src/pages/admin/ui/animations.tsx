import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApiService, type MediaItem } from '@/features/admin/services/media-api.service';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { MediaAsset } from '@/components/media/MediaAsset';
import { Button } from '@/components/ui/button';
import { MediaLibraryModal } from '@/components/admin/media/MediaLibraryModal';
import { useToast } from '@/hooks/use-toast';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog';

export default function AdminAnimationsPage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isUploadOpen, setIsUploadOpen] = useState(false);
	const [selected, setSelected] = useState<MediaItem | null>(null);

	const { data: animations = [], isLoading } = useQuery<MediaItem[]>({
		queryKey: ['admin-animations'],
		queryFn: () => mediaApiService.listLottie()
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => mediaApiService.deleteMedia(id),
		onSuccess: () => {
			toast({ title: 'Animation deleted' });
			queryClient.invalidateQueries({ queryKey: ['admin-animations'] });
			setSelected(null);
		},
		onError: (err: any) => {
			toast({ title: 'Delete failed', description: err?.message, variant: 'destructive' });
		}
	});

	const pageActions = <Button onClick={() => setIsUploadOpen(true)}>Upload .lottie</Button>;

	return (
		<AdminPageShell title="Animations Library" pageActions={pageActions}>
			{isLoading ? (
				<div className="p-8 text-center">Loading…</div>
			) : (
				<div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{animations.map((item) => (
						<div
							key={item.id}
							className="border border-zinc-800 rounded-md p-2 hover:border-zinc-500 cursor-pointer"
							onClick={() => setSelected(item)}
						>
							<MediaAsset url={item.url} mediaType={item.type} size={80} />
							<div className="mt-2 text-xs break-all">{item.id}</div>
						</div>
					))}
				</div>
			)}

			{/* Upload modal */}
			<MediaLibraryModal
				open={isUploadOpen}
				onClose={() => setIsUploadOpen(false)}
				onUploaded={() => {
					queryClient.invalidateQueries({ queryKey: ['admin-animations'] });
				}}
			/>

			{/* Preview modal */}
			{selected && (
				<Dialog open onOpenChange={() => setSelected(null)}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Animation Preview</DialogTitle>
						</DialogHeader>
						<div className="flex justify-center">
							<MediaAsset url={selected.url} mediaType={selected.type} size={200} />
						</div>
						<div className="mt-4 text-sm break-all">{selected.url}</div>
						<DialogFooter className="mt-4 space-x-2">
							<Button
								variant="secondary"
								onClick={() => {
									navigator.clipboard.writeText(selected.url);
									toast({ title: 'URL copied to clipboard' });
								}}
							>
								Copy URL
							</Button>
							<Button
								variant="destructive"
								onClick={() => deleteMutation.mutate(selected.id)}
								disabled={deleteMutation.isLoading}
							>
								{deleteMutation.isLoading ? 'Deleting…' : 'Delete'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</AdminPageShell>
	);
}
