import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import {
	mediaApiService,
	type MediaItem,
	type MediaType
} from '@/features/admin/services/media-api.service';
import { MediaAsset } from '@/components/media/MediaAsset';

interface Props {
	type: MediaType;
	open: boolean;
	onClose: () => void;
	onSelect: (media: MediaItem) => void;
}

export const MediaPickerModal: React.FC<Props> = ({ type, open, onClose, onSelect }) => {
	const { data: items = [], isLoading } = useQuery<MediaItem[]>({
		queryKey: ['media-picker', type],
		queryFn: () => mediaApiService.listMedia(type)
	});

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Select {type} asset</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="p-4 text-center">Loading…</div>
				) : (
					<div className="grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
						{items.map((item) => (
							<button
								key={item.id}
								className="border border-zinc-700 rounded-md p-2 hover:border-zinc-500"
								onClick={() => {
									onSelect(item);
									onClose();
								}}
							>
								<MediaAsset url={item.url} mediaType={item.type} size={64} />
							</button>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
