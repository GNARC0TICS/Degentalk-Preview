import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@app/components/ui/button';
import { Textarea } from '@app/components/ui/textarea';
import { useThreadActions } from '@app/features/forum/contexts/ThreadActionsContext';
import { cn } from '@app/utils/utils';

export interface QuickReplyInputProps {
	className?: string;
}

const QuickReplyInput: React.FC<QuickReplyInputProps> = ({ className }) => {
	const { quickReply } = useThreadActions();
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState('');
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-focus when opened
	useEffect(() => {
		if (open && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [open]);

	const handleSubmit = () => {
		if (!content.trim()) return;
		quickReply(content.trim());
		setContent('');
		setOpen(false);
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		}
	};

	if (!open) {
		return (
			<Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
				Reply
			</Button>
		);
	}

	return (
		<div className={cn('space-y-2', className)}>
			<Textarea
				ref={textareaRef}
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Write a quick reply…"
				rows={3}
			/>
			<div className="flex gap-2">
				<Button size="sm" onClick={handleSubmit}>
					Send
				</Button>
				<Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
					Cancel
				</Button>
			</div>
		</div>
	);
};

export default QuickReplyInput;
