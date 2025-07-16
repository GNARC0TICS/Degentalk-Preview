import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { MediaAsset } from '@/components/media/MediaAsset';
import { MediaPickerModal } from '@/features/admin/media/media/MediaPickerModal';
import type { EntityId } from '@shared/types/ids';

interface Props {
	iconUrl: string;
	onChange: (url: string, mediaId?: EntityId) => void;
}

export const TitleMediaInput: React.FC<Props> = ({ iconUrl, onChange }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="grid gap-2">
			<label className="text-sm">Title Banner</label>
			<div className="flex gap-2 items-center">
				{iconUrl ? (
					<MediaAsset url={iconUrl} mediaType="title" size={120} />
				) : (
					<span className="text-sm text-muted-foreground">No banner selected</span>
				)}
				<Button type="button" variant="outline" size="icon" onClick={() => setOpen(true)}>
					<Upload className="h-4 w-4" />
				</Button>
			</div>

			<MediaPickerModal
				type="title"
				open={open}
				onClose={() => setOpen(false)}
				onSelect={(media) => {
					onChange(media.url, media.id);
				}}
			/>
		</div>
	);
};
