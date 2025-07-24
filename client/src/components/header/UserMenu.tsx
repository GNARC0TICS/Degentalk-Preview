import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconRenderer } from '@app/components/icons/iconRenderer';
import { Button } from '@app/components/ui/button';
import { Avatar, AvatarFallback } from '@app/components/ui/avatar';
import { Progress } from '@app/components/ui/progress';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@app/components/ui/dropdown-menu';
import { NavLink } from './NavLink';
import { createUserMenuItems } from '@app/config/navigation';
import { useHeader } from './HeaderContext';
import { useAuth } from '@app/hooks/use-auth';

// Helper to calculate next level XP requirement
const calculateNextLevelXp = (level: number): number => {
	return Math.floor(1000 * Math.pow(1.2, level - 1));
};

// Framer Motion variants
const dropdownVariants = {
	hidden: {
		opacity: 0,
		scale: 0.95,
		y: -10
	},
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			duration: 0.2,
			ease: [0.16, 1, 0.3, 1]
		}
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		y: -10,
		transition: {
			duration: 0.15,
			ease: 'easeIn'
		}
	}
};

const dropdownItemVariants = {
	hidden: { opacity: 0, x: -10 },
	visible: (i: number) => ({
		opacity: 1,
		x: 0,
		transition: {
			delay: i * 0.03,
			duration: 0.2,
			ease: 'easeOut'
		}
	}),
	hover: {
		x: 5,
		transition: {
			duration: 0.2
		}
	}
};

interface UserMenuProps {
	className?: string;
	onLogout?: () => void;
}

export function UserMenu({ className, onLogout }: UserMenuProps) {
	const { user, toggleWallet } = useHeader();
	const { isAdmin, isModerator } = useAuth();

	if (!user || !user.username) {
		return null;
	}

	const nextLevelXp = calculateNextLevelXp((user.level || 1) + 1);
	const progressPercentage = ((user.xp || 0) / nextLevelXp) * 100;

	const menuItems = createUserMenuItems(
		user.username,
		isAdmin,
		isModerator,
		toggleWallet,
		onLogout
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					transition={{ duration: 0.2 }}
				>
					<Button variant="ghost" className={`p-1 ${className}`}>
						<div className="flex items-center space-x-2">
							<Avatar className="h-8 w-8">
								<AvatarFallback className="bg-emerald-800 text-emerald-200">
									{user.username.substring(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="hidden lg:flex items-center">
								<span className="text-zinc-300">{user.username}</span>
								<motion.div animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
									<IconRenderer
										icon="chevronDown"
										size={16}
										className="ml-1 h-4 w-4 text-zinc-500"
									/>
								</motion.div>
							</span>
						</div>
					</Button>
				</motion.div>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56 overflow-hidden">
				<AnimatePresence>
					<motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
						<DropdownMenuLabel>My Account</DropdownMenuLabel>

						{/* Progress Utility */}
						<DropdownMenuItem disabled className="opacity-100 cursor-default">
							<div className="flex flex-col w-full">
								<span className="text-xs text-zinc-400 mb-1">Level {user.level}</span>
								<Progress value={progressPercentage} className="h-2" />
								<span className="text-[10px] text-zinc-500 mt-1">
									{user.xp.toLocaleString()}/{nextLevelXp.toLocaleString()} XP
								</span>
							</div>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						{menuItems.map((item, index) => {
							if (item.separator) {
								return <DropdownMenuSeparator key={item.label} />;
							}

							const content = (
								<motion.div
									custom={index}
									variants={dropdownItemVariants}
									initial="hidden"
									animate="visible"
									whileHover="hover"
									key={item.label}
								>
									<DropdownMenuItem onClick={item.onClick}>
										<div className="flex w-full items-center cursor-pointer">
											{item.icon}
											<span>{item.label}</span>
										</div>
									</DropdownMenuItem>
								</motion.div>
							);

							if (item.href) {
								return (
									<NavLink key={item.label} href={item.href}>
										{content}
									</NavLink>
								);
							}

							return content;
						})}
					</motion.div>
				</AnimatePresence>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
