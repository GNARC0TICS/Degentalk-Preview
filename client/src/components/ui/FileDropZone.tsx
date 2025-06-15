import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

export interface FileDropZoneProps {
	/**
	 * Callback invoked after a file is selected (either via drop or click).
	 * Should return a promise if asynchronous work is needed (e.g., uploading to server)
	 */
	onFileSelected: (file: File) => Promise<void> | void;
	/**
	 * Allowed mime types. Example: ['image/jpeg', 'image/png']
	 */
	accept?: string[];
	/**
	 * Maximum file size in bytes. Defaults to 10 MB.
	 */
	maxSize?: number;
	/**
	 * Optional class name for styling overrides.
	 */
	className?: string;
	/**
	 * Whether to show a preview thumbnail after a file is selected.
	 * Only works for images.
	 */
	showPreview?: boolean;
}

/*
 * Generic, unopinionated drag-and-drop component.
 * Uses react-dropzone under the hood.
 */
export const FileDropZone: React.FC<FileDropZoneProps> = ({
	onFileSelected,
	accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
	maxSize = 10 * 1024 * 1024, // 10 MB
	className,
	showPreview = true
}) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!acceptedFiles || acceptedFiles.length === 0) {
				return;
			}
			const file = acceptedFiles[0];
			if (file.size > maxSize) {
				return alert('File is too large.');
			}
			try {
				setIsUploading(true);
				showPreview && setPreviewUrl(URL.createObjectURL(file));
				await onFileSelected(file);
			} finally {
				setIsUploading(false);
			}
		},
		[onFileSelected, maxSize, showPreview]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<string, string[]>),
		multiple: false
	});

	return (
		<div
			{...getRootProps()}
			className={cn(
				'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
				isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-700 hover:bg-zinc-800/40',
				className
			)}
		>
			<input {...getInputProps()} />
			{previewUrl && showPreview ? (
				<img src={previewUrl} alt="Preview" className="max-h-32 object-contain rounded-md" />
			) : (
				<div className="flex flex-col items-center gap-2">
					{isUploading ? (
						<UploadCloud className="h-6 w-6 animate-bounce text-emerald-400" />
					) : (
						<ImageIcon className="h-6 w-6 text-zinc-400" />
					)}
					<p className="text-sm text-zinc-400">
						{isDragActive ? 'Drop the file here' : 'Drag & drop or click to upload'}
					</p>
					<p className="text-xs text-zinc-500">Max size {(maxSize / (1024 * 1024)).toFixed(0)} MB</p>
				</div>
			)}
		</div>
	);
}; 