import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@app/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';

export function BackToHomeButton() {
	return (
		<motion.div
			className="mb-6"
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Link to="/">
				<Button
					variant="ghost"
					className="flex items-center text-zinc-400 hover:text-white transition-colors"
				>
					<ChevronLeft className="h-4 w-4 mr-1" />
					<Home className="h-4 w-4 mr-1" />
					Back to Home
				</Button>
			</Link>
		</motion.div>
	);
}

export default BackToHomeButton;
