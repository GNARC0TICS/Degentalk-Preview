import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { MessageSquareWave } from '@/components/messages/icons/MessageSquareWave';
import { WhisperModal } from './WhisperModal';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/use-messages';
import { useQuery } from '@tanstack/react-query';

interface WhisperButtonProps extends ButtonProps {
	userId?: number;
	username?: string;
	avatarUrl?: string;
	label?: string;
	showIcon?: boolean;
}

export function WhisperButton({
	userId,
	username,
	avatarUrl,
	label = 'Whisper',
	showIcon = true,
	children,
	...props
}: WhisperButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { useUnreadCount } = useMessages();
	const { data: unreadCountData } = useUnreadCount();

	// Fetch current user data (if not already available)
	const { data: currentUser } = useQuery({
		queryKey: ['/api/users/me']
	});

	const hasUnread = unreadCountData?.total > 0;

	// This will open the modal with a specific user preselected if userId is provided
	const handleClick = () => {
		setIsOpen(true);
	};

	return (
		<>
			<Button onClick={handleClick} variant="ghost" size="sm" className="relative" {...props}>
				{showIcon && (
					<MessageSquareWave className="h-5 w-5 text-indigo-400 hover:text-indigo-300 mr-2" />
				)}
				{children || label}
				{hasUnread && !userId && (
					<Badge
						variant="outline"
						className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-purple-600 text-white border-none"
					>
						{unreadCountData.total > 99 ? '99+' : unreadCountData.total}
					</Badge>
				)}
			</Button>

			<WhisperModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				initialUser={
					userId
						? {
								id: userId,
								username: username || '',
								avatarUrl: avatarUrl || ''
							}
						: undefined
				}
			/>
		</>
	);
}
