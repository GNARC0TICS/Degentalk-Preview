import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@app/utils/utils';
import { UploadCloud, Image as ImageIcon, CheckCircle } from 'lucide-react';

export interface FileDropZoneProps {
	/**
	 * Callback invoked after a file is selected (either via drop or click).
	 * Can now receive progress updates through the onProgress parameter
	 */
	onFileSelected: (file: File, onProgress?: (progress: number) => void) => Promise<void> | void;
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
	/**
	 * Whether the component is currently disabled (e.g., during upload)
	 */
	disabled?: boolean;
	/**
	 * Optional placeholder text
	 */
	placeholder?: string;
	/**
	 * Optional error message
	 */
	errorMessage?: string;
	/**
	 * Optional helper text
	 */
	helperText?: string;
	/**
	 * Multiple file selection
	 */
	multiple?: boolean | undefined;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
	onFileSelected,
	accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
	maxSize = 10 * 1024 * 1024, // 10 MB
	className,
	showPreview = true,
	disabled = false
}) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadComplete, setUploadComplete] = useState(false);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!acceptedFiles || acceptedFiles.length === 0 || disabled) {
				return;
			}

			const file = acceptedFiles[0];
			if (file.size > maxSize) {
				// Using alert for now, ProfileEditor will handle toast for more complex errors
				alert(`File is too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(0)} MB.`);
				return;
			}

			try {
				setIsUploading(true);
				setUploadProgress(0);
				setUploadComplete(false);

				if (showPreview && file.type.startsWith('image/')) {
					if (previewUrl) URL.revokeObjectURL(previewUrl); // Revoke old preview URL
					setPreviewUrl(URL.createObjectURL(file));
				}

				const handleProgress = (progress: number) => {
					setUploadProgress(Math.min(progress, 100));
				};

				await onFileSelected(file, handleProgress);

				setUploadProgress(100);
				setUploadComplete(true);

				setTimeout(() => {
					setUploadComplete(false);
					setUploadProgress(0);
					// Optionally clear previewUrl here if desired after successful upload
					// if (showPreview) setPreviewUrl(null);
				}, 2000);
			} catch (error) {
				// Error logging should be handled by the parent component
				// Error display (e.g., toast) should be handled by the parent (ProfileEditor)
				// Reset local state
				setUploadProgress(0);
				setUploadComplete(false);
				if (showPreview) setPreviewUrl(null); // Clear preview on error
			} finally {
				setIsUploading(false);
			}
		},
		[onFileSelected, maxSize, showPreview, disabled, previewUrl] // Added previewUrl to dependencies
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<string, string[]>),
		multiple: false,
		disabled: disabled || isUploading
	});

	const getDropzoneState = () => {
		if (disabled && !isUploading) return 'disabled'; // Ensure disabled prop takes precedence if not uploading
		if (uploadComplete) return 'complete';
		if (isUploading) return 'uploading';
		if (isDragActive) return 'active';
		return 'idle';
	};

	const dropzoneState = getDropzoneState();

	return (
		<div
			{...getRootProps()}
			className={cn(
				'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200',
				{
					'border-emerald-500 bg-emerald-500/10': dropzoneState === 'active',
					'border-zinc-700 hover:bg-zinc-800/40 cursor-pointer': dropzoneState === 'idle',
					'border-amber-500 bg-amber-500/10': dropzoneState === 'uploading',
					'border-green-500 bg-green-500/10': dropzoneState === 'complete',
					'border-zinc-600 bg-zinc-800/20 cursor-not-allowed opacity-60':
						dropzoneState === 'disabled'
				},
				className
			)}
		>
			<input {...getInputProps()} />
			{previewUrl &&
			showPreview &&
			dropzoneState !== 'uploading' &&
			dropzoneState !== 'complete' ? ( // Hide preview during active upload/complete if progress overlay is used
				<img src={previewUrl} alt="Preview" className="max-h-32 object-contain rounded-md" />
			) : (
				<div className="flex flex-col items-center gap-2">
					{uploadComplete ? (
						<CheckCircle className="h-6 w-6 text-green-400" />
					) : isUploading ? (
						<div className="flex flex-col items-center gap-2">
							<UploadCloud className="h-6 w-6 animate-bounce text-emerald-400" />
							<div className="w-24 h-1 bg-zinc-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-emerald-500 transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
							<span className="text-xs text-emerald-400">{uploadProgress}%</span>
						</div>
					) : (
						<ImageIcon className="h-6 w-6 text-zinc-400" />
					)}

					<p className="text-sm text-zinc-400">
						{uploadComplete
							? 'Upload complete!'
							: isUploading
								? 'Uploading...'
								: isDragActive
									? 'Drop the file here'
									: 'Drag & drop or click to upload'}
					</p>

					{!isUploading && !uploadComplete && (
						<p className="text-xs text-zinc-500">
							Max size {(maxSize / (1024 * 1024)).toFixed(0)} MB
						</p>
					)}
				</div>
			)}
			{/* Progress overlay for image preview, shown when preview is active and uploading */}
			{previewUrl && showPreview && isUploading && (
				<div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
					<div className="text-center">
						<div className="w-16 h-1 bg-zinc-700 rounded-full overflow-hidden mb-2">
							<div
								className="h-full bg-emerald-500 transition-all duration-300"
								style={{ width: `${uploadProgress}%` }}
							/>
						</div>
						<span className="text-xs text-white">{uploadProgress}%</span>
					</div>
				</div>
			)}
		</div>
	);
};
