import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface InlineErrorProps {
	message: string;
	className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className }) => (
	<div className={`flex items-center gap-1 text-sm text-red-600 ${className ?? ''}`}>
		<AlertTriangle className="h-4 w-4" />
		<span>{message}</span>
	</div>
);

export default InlineError;
