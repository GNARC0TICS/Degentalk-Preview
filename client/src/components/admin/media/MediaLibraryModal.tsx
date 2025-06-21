import React, { useState, useCallback } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { MediaAsset } from '@/components/media/MediaAsset';
import { useToast } from '@/hooks/use-toast';
import {
	mediaApiService,
	type MediaItem,
	type MediaType
} from '@/features/admin/services/media-api.service';

interface Props {
	open: boolean;
	onClose: () => void;
	onUploaded: (item: MediaItem) => void;
}

export const MediaLibraryModal: React.FC<Props> = ({ open, onClose, onUploaded }) => {
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [assetType, setAssetType] = useState<MediaType>('lottie');
	const { toast } = useToast();

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (!acceptedFiles?.length) return;
			const picked = acceptedFiles[0];
			if (picked.size > 2 * 1024 * 1024) {
				toast({ title: 'File too large (max 2MB)', variant: 'destructive' });
				return;
			}
			setFile(picked);
			const objectUrl = URL.createObjectURL(picked);
			setPreviewUrl(objectUrl);
		},
		[toast]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/octet-stream': ['.lottie'],
			'image/png': ['.png'],
			'image/jpeg': ['.jpg', '.jpeg'],
			'image/webp': ['.webp']
		}
	});

	const handleUpload = async () => {
		if (!file) return;
		setIsUploading(true);
		try {
			const media = await mediaApiService.uploadMedia(file, assetType);
			toast({ title: '.lottie uploaded successfully' });
			onUploaded(media);
			setFile(null);
			setPreviewUrl(null);
			onClose();
		} catch (err: any) {
			toast({
				title: 'Upload failed',
				description: err?.message || 'Unknown error',
				variant: 'destructive'
			});
		} finally {
			setIsUploading(false);
		}
	};

	const reset = () => {
		setFile(null);
		setPreviewUrl(null);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Upload .lottie Animation</DialogTitle>
				</DialogHeader>

				<div className="mb-4">
					<label className="block text-sm mb-1">Upload type</label>
					<select
						value={assetType}
						onChange={(e) => setAssetType(e.target.value as MediaType)}
						className="border bg-zinc-900 border-zinc-700 rounded-md px-2 py-1 text-sm"
					>
						<option value="emoji">Emoji</option>
						<option value="badge">Badge</option>
						<option value="title">Title</option>
						<option value="lottie">Animation</option>
						<option value="flair">Flair</option>
					</select>
				</div>

				<div
					{...getRootProps({
						className:
							'border-2 border-dashed border-zinc-600 rounded-md p-6 text-center cursor-pointer'
					})}
				>
					<input {...getInputProps()} />
					{isDragActive ? (
						<p>Drop the .lottie file here…</p>
					) : (
						<p>Drag & drop a .lottie file here, or click to select</p>
					)}
				</div>

				{previewUrl && (
					<div className="flex justify-center mt-4">
						<MediaAsset url={previewUrl} mediaType={assetType} size={128} />
					</div>
				)}

				<DialogFooter className="mt-4">
					<Button
						variant="secondary"
						onClick={() => {
							reset();
							onClose();
						}}
					>
						Cancel
					</Button>
					<Button disabled={!file || isUploading} onClick={handleUpload}>
						{isUploading ? 'Uploading…' : 'Upload'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
