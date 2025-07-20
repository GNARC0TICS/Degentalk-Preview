import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { useHeader } from './HeaderContext.tsx';
import { IconRenderer } from '@/components/icons/iconRenderer';

// Framer Motion variants
const notificationButtonVariants = {
	rest: { scale: 1 },
	hover: {
		scale: 1.05,
		transition: {
			duration: 0.2,
			ease: 'easeOut'
		}
	},
	tap: { scale: 0.95 }
};

const notificationBadgeVariants = {
	initial: { scale: 0, opacity: 0 },
	animate: {
		scale: 1,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 500,
			damping: 15
		}
	},
	pulse: {
		scale: [1, 1.2, 1],
		transition: {
			duration: 0.6,
			repeat: Infinity,
			repeatDelay: 3
		}
	}
};

interface NotificationButtonProps {
	className?: string;
}

export function NotificationButton({ className }: NotificationButtonProps) {
	const { unreadNotifications, user } = useHeader();
	const [isOpen, setIsOpen] = useState(false);

	if (!user || unreadNotifications === 0) {
		return null;
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<motion.div
					variants={notificationButtonVariants}
					initial="rest"
					whileHover="hover"
					whileTap="tap"
					className={className}
				>
					<Button
						variant="ghost"
						size="icon"
						className="relative text-zinc-400 hover:text-emerald-400 focus:text-emerald-400 transition-all duration-200"
						onClick={() => setIsOpen(true)}
					>
						<IconRenderer icon="megaphone" size={20} className="h-5 w-5" />
						{unreadNotifications > 0 && (
							<motion.div
								className="absolute -top-1 -right-1"
								variants={notificationBadgeVariants}
								initial="initial"
								animate={['animate', 'pulse']}
							>
								<Badge className="px-1.5 h-4 min-w-4 bg-red-500 flex items-center justify-center text-[10px]">
									{unreadNotifications > 99 ? '99+' : unreadNotifications}
								</Badge>
							</motion.div>
						)}
					</Button>
				</motion.div>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-96 p-0">
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.2 }}
				>
					<NotificationPanel />
				</motion.div>
			</PopoverContent>
		</Popover>
	);
}
