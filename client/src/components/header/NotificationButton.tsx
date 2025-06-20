import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { useHeader } from './HeaderContext';

// Custom Megaphone icon (from original header)
const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 256 256"
		fill="none"
		stroke="currentColor"
		strokeWidth={12}
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="M246 120a46.05 46.05 0 0 0-46-46h-39.85c-2.58-.15-54.1-3.57-103.15-44.71A14 14 0 0 0 34 40v160a13.85 13.85 0 0 0 8.07 12.68A14.2 14.2 0 0 0 48 214a13.9 13.9 0 0 0 9-3.3c40-33.52 81.57-42 97-44.07v34a14 14 0 0 0 6.23 11.65l11 7.33a14 14 0 0 0 21.32-8.17l12.13-45.71A46.07 46.07 0 0 0 246 120M49.29 201.52A2 2 0 0 1 46 200V40a1.9 1.9 0 0 1 1.15-1.8A2.1 2.1 0 0 1 48 38a1.9 1.9 0 0 1 1.26.48c44 36.92 89 45.19 104.71 47v69c-15.68 1.85-60.67 10.13-104.68 47.04m131.64 7a2 2 0 0 1-3.05 1.18l-11-7.33a2 2 0 0 1-.89-1.67V166h26.2ZM200 154h-34V86h34a34 34 0 1 1 0 68" />
	</svg>
);

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
	const { unreadNotifications } = useHeader();
	const [isOpen, setIsOpen] = useState(false);

	if (unreadNotifications === 0) {
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
						<MegaphoneIcon className="h-5 w-5" />
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
