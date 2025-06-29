import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export interface ImageUploadProps {
	value?: string | File | null; // URL string or File object
	onChange: (file: File | null) => void;
	label?: React.ReactNode;
	className?: string;
	accept?: string;
	maxSize?: number; // bytes
}

/**
 * Generic image drag-and-drop uploader with preview and validation.
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
	value,
	onChange,
	label,
	className,
	accept = 'image/*',
	maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles && acceptedFiles[0]) {
				onChange(acceptedFiles[0]);
			}
		},
		[onChange]
	);

	const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
		accept,
		maxSize,
		multiple: false,
		onDrop
	});

	const previewUrl = React.useMemo(() => {
		if (!value) return undefined;
		if (typeof value === 'string') return value;
		return URL.createObjectURL(value);
	}, [value]);

	return (
		<div className={className}>
			{label && (
				<label className="block mb-1 text-sm font-medium text-muted-foreground">{label}</label>
			)}
			<div
				{...getRootProps({
					className: `border-2 border-dashed rounded flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
						isDragActive ? 'border-primary-500 bg-primary-50' : 'border-muted'
					}`
				})}
			>
				<input {...getInputProps()} />
				{previewUrl ? (
					<img src={previewUrl} alt="preview" className="max-h-40 object-contain mb-2" />
				) : (
					<p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
				)}
			</div>
			{fileRejections.length > 0 && (
				<p className="mt-2 text-xs text-red-600">
					File must be an image under {maxSize / 1024 / 1024}MB.
				</p>
			)}
		</div>
	);
};

export default ImageUpload;
