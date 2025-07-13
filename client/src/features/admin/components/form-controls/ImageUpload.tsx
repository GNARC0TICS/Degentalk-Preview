import React, { useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';

export interface ImageUploadProps {
	value?: string | File | null | undefined; // URL string or File object
	onChange: (file: File | null) => void;
	label?: React.ReactNode | undefined;
	className?: string;
	accept?: Accept | undefined;
	maxSize?: number | undefined; // bytes
	// Common props that admin pages often pass
	disabled?: boolean | undefined;
	multiple?: boolean | undefined;
	previewSize?: number | undefined;
	placeholder?: string;
	errorMessage?: string;
	showPreview?: boolean | undefined;
	variant?: 'default' | 'compact' | 'large' | undefined;
	required?: boolean | undefined;
	helperText?: string;
}

/**
 * Generic image drag-and-drop uploader with preview and validation.
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
	value,
	onChange,
	label,
	className,
	accept = { 'image/*': [] },
	maxSize = 5 * 1024 * 1024, // 5MB default
	disabled = false,
	multiple = false,
	previewSize = 40,
	placeholder = 'Drag & drop or click to upload',
	errorMessage,
	showPreview = true,
	variant = 'default',
	required = false,
	helperText
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
		multiple,
		onDrop,
		disabled
	});

	const previewUrl = React.useMemo(() => {
		if (!value) return undefined;
		if (typeof value === 'string') return value;
		return URL.createObjectURL(value);
	}, [value]);

	const getVariantClasses = () => {
		switch (variant) {
			case 'compact':
				return 'p-3 text-xs';
			case 'large':
				return 'p-8 text-base';
			default:
				return 'p-6 text-sm';
		}
	};

	const getPreviewClasses = () => {
		switch (variant) {
			case 'compact':
				return `max-h-${previewSize} object-contain mb-1`;
			case 'large':
				return `max-h-${previewSize * 2} object-contain mb-4`;
			default:
				return `max-h-${previewSize} object-contain mb-2`;
		}
	};

	return (
		<div className={className}>
			{label && (
				<label
					className={`block mb-1 text-sm font-medium text-muted-foreground ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
				>
					{label}
				</label>
			)}
			{helperText && <p className="text-xs text-muted-foreground mb-2">{helperText}</p>}
			<div
				{...getRootProps({
					className: `border-2 border-dashed rounded flex flex-col items-center justify-center text-center transition-colors ${getVariantClasses()} ${
						disabled
							? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
							: isDragActive
								? 'border-primary-500 bg-primary-50 cursor-pointer'
								: 'border-muted cursor-pointer hover:border-primary-400'
					}`
				})}
			>
				<input {...getInputProps()} />
				{showPreview && previewUrl ? (
					<img src={previewUrl} alt="preview" className={getPreviewClasses()} />
				) : (
					<p className="text-muted-foreground">{placeholder}</p>
				)}
			</div>
			{errorMessage && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}
			{fileRejections.length > 0 && (
				<p className="mt-2 text-xs text-red-600">
					File must be an image under {maxSize / 1024 / 1024}MB.
				</p>
			)}
		</div>
	);
};

export default ImageUpload;
