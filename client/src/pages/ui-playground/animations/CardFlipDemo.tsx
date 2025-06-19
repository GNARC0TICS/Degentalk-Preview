import React from 'react';
import { motion } from 'framer-motion';
import { DemoCard } from '@/pages/dev/DemoCard';
import { useMemo } from 'react';

export const CardFlipDemo: React.FC = () => {
	const initial = useMemo(() => ({ duration: 0.6 }), []);

	return (
		<DemoCard
			id="card-flip"
			title="Card Flip"
			initialProps={initial}
			render={({ duration }) => (
				<motion.div
					className="w-48 h-32 cursor-pointer perspective"
					whileHover={{ rotateY: 180 }}
					transition={{ duration: parseFloat(duration) || 0.6 }}
				>
					<motion.div
						className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center text-white backface-hidden"
						style={{ transformStyle: 'preserve-3d' }}
					>
						Front
					</motion.div>
					<motion.div
						className="w-full h-full bg-emerald-600 rounded-lg flex items-center justify-center text-black backface-hidden"
						style={{
							transform: 'rotateY(180deg)',
							position: 'absolute',
							top: 0,
							left: 0,
							transformStyle: 'preserve-3d'
						}}
					>
						Back
					</motion.div>
				</motion.div>
			)}
		/>
	);
};

export default CardFlipDemo;
