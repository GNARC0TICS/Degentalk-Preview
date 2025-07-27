import React, { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMentions } from '@/hooks/use-mentions';
import { MentionAutocomplete } from '@/components/mentions/MentionAutocomplete';

interface ShoutboxInputProps {
	onSendMessage: (message: string) => void;
	isLoading?: boolean;
	placeholder?: string;
	maxLength?: number;
}

export function ShoutboxInput({
	onSendMessage,
	isLoading = false,
	placeholder = 'Type a message...',
	maxLength = 300
}: ShoutboxInputProps) {
	const [message, setMessage] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const { mentionState, handleTextChange, handleMentionSelect, closeMentions, processMentions } =
		useMentions({
			onMentionSelect: (user) => {
				// Update the message with the selected mention
				if (inputRef.current && mentionState.startIndex !== -1) {
					const input = inputRef.current;
					const currentValue = input.value;
					const endIndex = mentionState.startIndex + 1 + mentionState.query.length; // +1 for @

					const newValue =
						currentValue.slice(0, mentionState.startIndex) +
						`@${user.username} ` +
						currentValue.slice(endIndex);

					setMessage(newValue);

					// Set cursor position after the mention
					setTimeout(() => {
						const newCursorPos = mentionState.startIndex + `@${user.username} `.length;
						input.setSelectionRange(newCursorPos, newCursorPos);
						input.focus();
					}, 0);
				}
			}
		});

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setMessage(value);
			handleTextChange(e);
		},
		[handleTextChange]
	);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter' && !e.shiftKey && !mentionState.isOpen) {
				e.preventDefault();
				handleSend();
			}
		},
		[mentionState.isOpen]
	);

	const handleSend = useCallback(async () => {
		if (!message.trim() || isLoading) return;

		// Process mentions before sending
		await processMentions(message, 'shoutbox');

		// Send the message
		onSendMessage(message.trim());
		setMessage('');
		closeMentions();
	}, [message, isLoading, onSendMessage, processMentions, closeMentions]);

	// Click outside to close mentions
	const handleInputBlur = useCallback(() => {
		// Delay closing to allow mention selection
		setTimeout(() => {
			closeMentions();
		}, 200);
	}, [closeMentions]);

	return (
		<div className="relative">
			<div className="flex gap-2">
				<div className="flex-1 relative">
					<Input
						ref={inputRef}
						value={message}
						onChange={handleInputChange}
						onKeyPress={handleKeyPress}
						onBlur={handleInputBlur}
						placeholder={placeholder}
						maxLength={maxLength}
						disabled={isLoading}
						className="pr-12"
					/>

					{/* Character count */}
					{message.length > maxLength * 0.8 && (
						<div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
							{maxLength - message.length}
						</div>
					)}
				</div>

				<Button
					onClick={handleSend}
					disabled={!message.trim() || isLoading}
					size="icon"
					className="h-9 w-9"
				>
					<Send className="h-4 w-4" />
				</Button>
			</div>

			{/* Mention Autocomplete */}
			<MentionAutocomplete
				query={mentionState.query}
				isOpen={mentionState.isOpen}
				onSelect={handleMentionSelect}
				onClose={closeMentions}
				position={mentionState.position}
				className="mt-1"
			/>
		</div>
	);
}
