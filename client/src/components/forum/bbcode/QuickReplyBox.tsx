import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { cn } from '@/utils/utils';
import type { ThreadId } from '@shared/types/ids';

interface QuickReplyBoxProps {
	threadId: ThreadId;
	threadTitle: string;
	userAvatar?: string;
	username?: string;
	onSubmit?: (content: string) => Promise<void>;
	className?: string;
}

export function QuickReplyBox({
	threadId,
	threadTitle,
	userAvatar,
	username,
	onSubmit,
	className = ''
}: QuickReplyBoxProps) {
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await onSubmit?.(content);
			setContent(''); // Clear on success
		} catch (error) {
			// Failed to submit reply
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className={cn(
				'bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/50 rounded-lg shadow-lg',
				className
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-zinc-700/30">
				<div className="flex items-center space-x-2">
					<MessageSquare className="h-4 w-4 text-zinc-400" />
					<span className="text-sm font-medium text-zinc-300">Quick Reply</span>
				</div>
				<div className="text-xs text-zinc-500">Replying to: {threadTitle}</div>
			</div>

			{/* Reply Form */}
			<form onSubmit={handleSubmit} className="p-4">
				<div className="flex space-x-3">
					{/* User Avatar */}
					<div className="flex-shrink-0">
						{userAvatar || username ? (
							<AvatarFrame
								avatarUrl={userAvatar || ''}
								frame={null}
								size={40}
								className="ring-1 ring-zinc-700/50"
							/>
						) : (
							<div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
								<User className="h-5 w-5 text-zinc-400" />
							</div>
						)}
					</div>

					{/* Input Area */}
					<div className="flex-1 space-y-3">
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Write your reply... (Markdown supported)"
							className={cn(
								'min-h-[80px] resize-none',
								'bg-zinc-800/60 border-zinc-600/50 text-zinc-200',
								'placeholder:text-zinc-500',
								'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20',
								'transition-all duration-200'
							)}
							disabled={isSubmitting}
						/>

						{/* Actions */}
						<div className="flex items-center justify-between">
							<div className="text-xs text-zinc-500">
								{content.length > 0 && (
									<span>
										{content.length} characters
										{content.length > 10000 && (
											<span className="text-amber-400 ml-1">(getting long)</span>
										)}
									</span>
								)}
							</div>

							<div className="flex items-center space-x-2">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setContent('')}
									disabled={!content.trim() || isSubmitting}
									className="text-zinc-400 hover:text-zinc-300"
								>
									Clear
								</Button>
								<Button
									type="submit"
									size="sm"
									disabled={!content.trim() || isSubmitting}
									className={cn(
										'bg-emerald-600 hover:bg-emerald-700 text-white',
										'disabled:opacity-50 disabled:cursor-not-allowed',
										'transition-all duration-200'
									)}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Posting...
										</>
									) : (
										<>
											<Send className="h-4 w-4 mr-2" />
											Post Reply
										</>
									)}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</form>
		</motion.div>
	);
}
