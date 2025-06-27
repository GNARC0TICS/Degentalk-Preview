// Mock implementation of the toast hook to allow the app to start
// This is a temporary solution until we implement the proper toast notifications

import { ReactNode } from 'react';

type ToastProps = {
	id?: string;
	title?: string;
	description?: string;
	variant?: 'default' | 'destructive';
	action?: ReactNode;
	duration?: number;
};

// Empty array of toasts for the initial state
const toasts: ToastProps[] = [];

export function useToast() {
	const toast = (props: ToastProps) => {
		// In a real implementation, this would add the toast to the toasts array
		// Toast would be displayed here
	};

	return {
		toast,
		toasts // Return empty array of toasts
	};
}
